variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "IAM role ARN for ECS task execution"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "IAM role ARN for ECS task"
  type        = string
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "container_port" {
  description = "Port the API container listens on"
  type        = number
  default     = 3001
}

variable "cpu" {
  description = "CPU units for the API task"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory (MiB) for the API task"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 2
}

variable "domain_name" {
  description = "Domain name for the API"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the API domain"
  type        = string
}

locals {
  cluster_name = "concourse-${var.environment}"
  service_name = "concourse-${var.environment}-api"
  task_family  = "concourse-${var.environment}-api"
}

resource "aws_ecs_cluster" "main" {
  name = local.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base             = 1
  }
}

resource "aws_lb" "api" {
  name               = "${local.service_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.subnet_ids

  tags = {
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api" {
  name        = "${local.service_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

    health_check {
    path                = "/healthz"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

data "aws_iam_policy_document" "task_execution" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = local.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([{
    name         = "concourse-api"
    image        = "${var.environment == "production" ? data.aws_caller_identity.current.account_id : "000000000000"}.dkr.ecr.us-east-1.amazonaws.com/concourse-api:latest"
    essential    = true
    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]
    environment = []
    secrets = [
      { name = "API_DATABASE_URL",                valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_DATABASE_URL" },
      { name = "API_SUPABASE_URL",                valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_SUPABASE_URL" },
      { name = "API_SUPABASE_SERVICE_ROLE_KEY",   valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_SUPABASE_SERVICE_ROLE_KEY" },
      { name = "API_SUPABASE_JWT_SECRET",         valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_SUPABASE_JWT_SECRET" },
      { name = "API_CORS_ORIGIN",                 valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_CORS_ORIGIN" },
      { name = "API_PUBLIC_WEB_ORIGIN",           valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/API_PUBLIC_WEB_ORIGIN" },
      { name = "ANTHROPIC_API_KEY",              valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/ANTHROPIC_API_KEY" },
      { name = "VOYAGE_API_KEY",                 valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/VOYAGE_API_KEY" },
      { name = "POSTHOG_API_KEY",                valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/POSTHOG_API_KEY" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${local.task_family}"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "api"
      }
    }
  }])

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecs_service" "api" {
  name            = local.service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "concourse-api"
    container_port   = var.container_port
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  tags = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${local.task_family}"
  retention_in_days = 30

  tags = {
    Environment = var.environment
  }
}

data "aws_caller_identity" "current" {}

output "cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_name" {
  value = aws_ecs_service.api.name
}

output "alb_dns_name" {
  value = aws_lb.api.dns_name
}

output "alb_zone_id" {
  value = aws_lb.api.zone_id
}

output "target_group_arn" {
  value = aws_lb_target_group.api.arn
}
