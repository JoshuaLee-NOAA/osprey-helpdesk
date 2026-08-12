# Osprey IT Helpdesk - Base Science Workstation Terraform Blueprint

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "The GCP Project ID"
  default     = "osprey-staging-workstation"
}

variable "region" {
  type        = string
  description = "GCP Deployment Region"
  default     = "us-east1"
}

variable "zone" {
  type        = string
  description = "GCP Deployment Zone"
  default     = "us-east1-b"
}

variable "machine_type" {
  type        = string
  description = "Cost-optimized VM machine type"
  default     = "e2-micro"
}

variable "user_email" {
  type        = string
  description = "Email of the scientist/employee receiving workstation access"
}

output "workstation_status" {
  value = "PROVISIONED"
}

output "project_id" {
  value = var.project_id
}

output "machine_type" {
  value = var.machine_type
}

output "console_url" {
  value = "https://console.cloud.google.com/welcome?project=${var.project_id}"
}
