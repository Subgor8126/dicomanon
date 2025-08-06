# infrastructure/variables.tf
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS Account ID for ECR repositories"
  type        = string
}

variable "existing_db_name" {
  description = "Name of existing RDS database instance"
  type        = string
}

variable "db_password" {
  description = "Password for the existing RDS PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "github_username" {
  description = "Your GitHub username"
  type        = string
}

variable "github_repo_name" {
  description = "Your GitHub repository name"
  type        = string
}