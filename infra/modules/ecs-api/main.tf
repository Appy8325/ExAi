# Terraform module: ecs-api -- implemented when Milestone 0's infra work begins in earnest; see docs/43-security-architecture.md and docs/00-foundation.md §6 for the target shape.

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}
