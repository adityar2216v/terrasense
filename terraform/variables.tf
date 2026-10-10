variable "aws_region" {
  description = "AWS Region to deploy to"
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name of the application (used for bucket names, ECR, etc.)"
  default     = "terrasense-prod-v1"
}

variable "supabase_url" {
  description = "Supabase Database URL"
  type        = string
}

variable "supabase_key" {
  description = "Supabase Service Role Key"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API Key for LangGraph Agents"
  type        = string
}
