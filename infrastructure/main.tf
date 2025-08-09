# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Comment out backend for now - create the bucket first
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "medical-ai/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# ===== DATA SOURCES (Reading existing resources) =====
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_route53_zone" "main" {
  name = "yantrahealth.in"
}

# Use existing default VPC
data "aws_vpc" "default" {
  default = true
}

# Get existing default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Use existing wildcard certificate
data "aws_acm_certificate" "existing" {
  domain   = "*.yantrahealth.in"
  statuses = ["ISSUED"]
  most_recent = true
}

# Use existing database
data "aws_db_instance" "existing" {
  db_instance_identifier = var.existing_db_name
}

# ===== SECURITY GROUPS =====
resource "aws_security_group" "alb" {
  name_prefix = "medical-ai-alb-"
  vpc_id      = data.aws_vpc.default.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "medical-ai-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name_prefix = "medical-ai-ecs-"
  vpc_id      = data.aws_vpc.default.id
  
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "medical-ai-ecs-sg"
  }
}

# ===== APPLICATION LOAD BALANCER =====
resource "aws_lb" "main" {
  name               = "medical-ai-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
  
  enable_deletion_protection = false
  
  tags = {
    Name = "medical-ai-alb"
  }
}

# ===== LOAD BALANCER TARGET GROUPS =====
resource "aws_lb_target_group" "backend" {
  name        = "medical-ai-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health/"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "medical-ai-backend-tg"
  }
}

resource "aws_lb_target_group" "frontend" {
  name        = "medical-ai-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "medical-ai-frontend-tg"
  }
}

# ===== COMMENTED OUT: GITHUB OIDC/ROLE =====
# resource "aws_iam_openid_connect_provider" "github" {
#   url = "https://token.actions.githubusercontent.com"
  
#   client_id_list = [
#     "sts.amazonaws.com",
#   ]
  
#   tags = {
#     Name = "github-actions-oidc"
#   }
# }

# resource "aws_iam_role" "github_actions" {
#   name = "GitHubActionsRole"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Federated = aws_iam_openid_connect_provider.github.arn
#         }
#         Action = "sts:AssumeRole"
#         Condition = {
#           StringEquals = {
#             "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
#           }
#         }
#       }
#     ]
#   })
# }

# resource "aws_iam_role_policy" "github_actions_policy" {
#   name = "GitHubActionsPolicy"
#   role = aws_iam_role.github_actions.id

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "ecr:GetAuthorizationToken",
#           "ecr:BatchCheckLayerAvailability",
#           "ecr:GetDownloadUrlForLayer",
#           "ecr:BatchGetImage",
#           "ecr:PutImage",
#           "ecr:InitiateLayerUpload",
#           "ecr:UploadLayerPart",
#           "ecr:CompleteLayerUpload"
#         ]
#         Resource = [
#           aws_ecr_repository.backend_repo.arn,
#           aws_ecr_repository.frontend_repo.arn,
#           "*"  # ECR GetAuthorizationToken requires wildcard
#         ]
#       }
#       # ===== COMMENTED OUT: ECS PERMISSIONS =====
#       # {
#       #   Effect = "Allow"
#       #   Action = [
#       #     "ecs:UpdateService",
#       #     "ecs:DescribeServices",
#       #     "ecs:DescribeTaskDefinition"
#       #   ]
#       #   Resource = [
#       #     aws_ecs_service.backend.id,
#       #     aws_ecs_service.frontend.id
#       #   ]
#       # }
#     ]
#   })
# }

# ===== LOAD BALANCER LISTENERS =====
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = data.aws_acm_certificate.existing.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  condition {
    host_header {
      values = ["dicomanon.yantrahealth.in"]
    }
  }
}

resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    host_header {
      values = ["api.dicomanon.yantrahealth.in"]
    }
  }
}

# HTTP to HTTPS redirect
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
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

# ===== ECS CLUSTER =====
resource "aws_ecs_cluster" "main" {
  name = "medical-ai-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "medical-ai-cluster"
  }
}

# ===== IAM ROLES FOR ECS =====
resource "aws_iam_role" "ecs_execution_role" {
  name = "medical-ai-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "medical-ai-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for accessing SageMaker (no S3 needed as discussed)
resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "medical-ai-ecs-task-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sagemaker:InvokeEndpoint"
        ]
        Resource = "*"
      }
    ]
  })
}

# ===== CLOUDWATCH LOGS =====
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/medical-ai-backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/medical-ai-frontend"
  retention_in_days = 7
}

# ===== ECR REPOSITORIES =====
resource "aws_ecr_repository" "backend_repo" {
  name = "medical-ai-backend-repo"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "medical-ai-backend-repo"
  }
}

resource "aws_ecr_repository" "frontend_repo" {
  name = "medical-ai-frontend-repo"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "medical-ai-frontend-repo"
  }
}

# ===== ECS TASK DEFINITIONS =====
resource "aws_ecs_task_definition" "backend" {
  family                   = "medical-ai-backend-td"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/medical-ai-backend-repo:latest"
      
      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://${data.aws_db_instance.existing.master_username}:${var.db_password}@${data.aws_db_instance.existing.address}:${data.aws_db_instance.existing.port}/${data.aws_db_instance.existing.db_name}"
        },
        {
          name  = "AWS_DEFAULT_REGION"
          value = var.aws_region
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      essential = true
    }
  ])
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "medical-ai-frontend-td"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/medical-ai-frontend-repo:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = "https://api.dicomanon.yantrahealth.in"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      essential = true
    }
  ])
}

# ===== ECS SERVICES =====
resource "aws_ecs_service" "backend" {
  name            = "medical-ai-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true  # Required for default VPC public subnets
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "medical-ai-backend-service"
  }
}

resource "aws_ecs_service" "frontend" {
  name            = "medical-ai-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true  # Required for default VPC public subnets
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "medical-ai-frontend-service"
  }
}

# ===== ROUTE53 RECORDS =====
resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "dicomanon"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.dicomanon"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}