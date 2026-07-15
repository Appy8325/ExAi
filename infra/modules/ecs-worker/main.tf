variable "environment" {
  description = "Deployment environment"
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

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "cpu" {
  description = "CPU units for the worker task"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory (MiB) for the worker task"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of worker tasks"
  type        = number
  default     = 1
}

locals {
  service_name = "concourse-${var.environment}-worker"
  task_family  = "concourse-${var.environment}-worker"
}

resource "aws_ecs_task_definition" "worker" {
  family                   = local.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([{
    name      = "concourse-worker"
    image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.us-east-1.amazonaws.com/concourse-worker:latest"
    essential = true
    environment = []
    secrets = [
      { name = "WORKER_DATABASE_URL",             valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/WORKER_DATABASE_URL" },
      { name = "WORKER_REDIS_URL",                valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/WORKER_REDIS_URL" },
      { name = "ANTHROPIC_API_KEY",              valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/ANTHROPIC_API_KEY" },
      { name = "VOYAGE_API_KEY",                 valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/VOYAGE_API_KEY" },
      { name = "POSTHOG_API_KEY",                valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:concourse/${var.environment}/POSTHOG_API_KEY" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${local.task_family}"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "worker"
      }
    }
  }])

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecs_service" "worker" {
  name            = local.service_name
  cluster         = var.cluster_name
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = [var.security_group_id]
    assign_public_ip = false
  }

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  tags = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${local.task_family}"
  retention_in_days = 30

  tags = {
    Environment = var.environment
  }
}

data "aws_caller_identity" "current" {}

output "service_name" {
  value = aws_ecs_service.worker.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.worker.arn
}
