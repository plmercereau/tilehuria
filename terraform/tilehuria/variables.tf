variable "do_token" {}

variable "project_name" {
  type        = string
  default     = "tilehuria"
  description = "The name of the project"
}

variable "environment" {
  type        = string
  default     = "staging"
  description = "Environment to deploy: production or staging"
}

variable "domain" {
  type        = string
  default     = "tilehuria.platyplus.io"
  description = "The main DNS name for the application"
}

variable "region" {
  type        = string
  default     = "ams3"
  description = "The Digital Ocean region to deploy kubernetes into"
}

variable "auto_scale" {
  type        = bool
  default     = true
  description = "Autoscale the cluster"
}

variable "min_nodes" {
  type        = number
  default     = 1
  description = "Minimum number of nodes in the cluster"
}

variable "max_nodes" {
  type        = number
  default     = 3
  description = "Maximum number of nodes in the cluster"
}

# variable "project_id" {
#   type        = string
#   description = "The project ID to deploy resources into"
# }

# variable "subnetwork" {
#   type        = string
#   default     = "default"
#   description = "The name of the subnetwork to deploy instances into"
# }

# variable "rabbitmq_instance_name" {
#   type    = string
#   default = "rabbitmq"
# }

# variable "rabbitmq_erlang_cookie" {
#   type        = string
#   description = "RabbitMQ Erland cookie"
# }

# variable "rabbitmq_default_user" {
#   type        = string
#   description = "RabbitMQ default user"
#   default     = "guest"
# }

# variable "rabbitmq_default_password" {
#   type        = string
#   description = "RabbitMQ default password"
# }

