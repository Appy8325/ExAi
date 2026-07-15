terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "concourse-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "concourse-terraform-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "domain_name" {
  description = "Root domain name (e.g., exai.app)"
  type        = string
  default     = "api.exai.app"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the API domain"
  type        = string
}

# Retrieve the hosted zone for the domain
data "aws_route53_zone" "main" {
  name = var.domain_name
}

module "network" {
  source = "../../modules/network"

  environment = "production"
}

module "iam" {
  source = "../../modules/iam"

  environment = "production"
}

module "elasticache" {
  source = "../../modules/elasticache"

  environment      = "production"
  subnet_ids       = module.network.private_subnet_ids
  security_group_id = module.network.redis_security_group_id
  node_type        = "cache.t4g.micro"
}

module "ecs_api" {
  source = "../../modules/ecs-api"

  environment                = "production"
  vpc_id                     = module.network.vpc_id
  subnet_ids                 = module.network.public_subnet_ids
  security_group_id          = module.network.ecs_tasks_security_group_id
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.iam.ecs_task_role_arn
  alb_security_group_id       = module.network.alb_security_group_id
  container_port             = 3001
  cpu                        = 512
  memory                     = 1024
  desired_count              = 2
  domain_name                = var.domain_name
  certificate_arn            = var.certificate_arn
}

module "ecs_worker" {
  source = "../../modules/ecs-worker"

  environment                = "production"
  subnet_ids                 = module.network.private_subnet_ids
  security_group_id          = module.network.ecs_tasks_security_group_id
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.iam.ecs_task_role_arn
  cluster_name               = module.ecs_api.cluster_name
  cpu                        = 256
  memory                     = 512
  desired_count              = 1
}

# Route53 record for the API ALB
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.ecs_api.alb_dns_name
    zone_id                = module.ecs_api.alb_zone_id
    evaluate_target_health = true
  }
}

output "api_url" {
  value = "https://${var.domain_name}"
}

output "alb_dns_name" {
  value = module.ecs_api.alb_dns_name
}

output "redis_endpoint" {
  value = module.elasticache.redis_connection_string
  sensitive = true
}
