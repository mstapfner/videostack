# Northflank Deployment Guide

This guide explains how to deploy the VideoStack backend service to Northflank.

## Prerequisites

1. Northflank account and CLI installed
2. Domain name (for production deployment)
3. Environment variables/secrets configured

## Quick Deployment

### 1. Install Northflank CLI

```bash
# Install Northflank CLI
curl -s https://cli.northflank.com | bash

# Or via npm
npm install -g @northflank/cli
```

### 2. Login to Northflank

```bash
northflank login
```

### 3. Create Project

```bash
northflank create project --name videostack --description "VideoStack API Backend"
```

### 4. Deploy Services

```bash
# Deploy from the project root
northflank deploy --file northflank.yaml
```

## Manual Deployment Steps

### 1. Create Database Service

1. Go to Northflank Dashboard
2. Create a new PostgreSQL service:
   - Name: `videostack-db`
   - Version: PostgreSQL 15
   - Region: Auto
   - Disk: 10GB SSD

3. Set environment variables:
   - `POSTGRES_DB`: videostack
   - `POSTGRES_USER`: videostack_user
   - `POSTGRES_PASSWORD`: [generate secure password]

### 2. Configure Secrets

In Northflank Dashboard, go to Project Settings > Secrets and add:

- `DB_PASSWORD`: [your database password]
- `WORKOS_CLIENT_ID`: [your WorkOS client ID]
- `WORKOS_API_KEY`: [your WorkOS API key]
- `OPENAI_API_KEY`: [your OpenAI API key]
- `GROQ_API_KEY`: [your Groq API key]
- `RUNWARE_API_KEY`: [your Runware API key]

### 3. Create Backend Service

1. Create a new service from Docker image
2. Use the existing Dockerfile in `services/backend/`
3. Configure environment variables (they will use the secrets you created)
4. Set port to 8000
5. Enable public access

### 4. Domain Configuration

1. Add your domain in Northflank
2. Point your domain's CNAME to your Northflank service
3. Update CORS origins in environment variables

## Environment Variables

The following environment variables need to be configured:

### Required Secrets (in Northflank Dashboard):
- `DB_PASSWORD`: Database password
- `WORKOS_CLIENT_ID`: WorkOS authentication client ID
- `WORKOS_API_KEY`: WorkOS authentication API key
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `GROQ_API_KEY`: Groq API key for LLM features
- `RUNWARE_API_KEY`: Runware API key for image generation

### Application Configuration:
- `DATABASE_URL`: Auto-configured by Northflank
- `PORT`: 8000 (default)
- `ENVIRONMENT`: production
- `LOG_LEVEL`: INFO
- `CORS_ORIGINS`: Your domain(s)

## Production Optimizations

The deployment includes several production optimizations:

1. **Multi-stage Docker build** for smaller image size
2. **Non-root user** for security
3. **Health checks** for proper load balancer integration
4. **Multiple workers** for better performance
5. **uvloop** for improved async performance

## Monitoring and Health Checks

- Health check endpoint: `GET /health`
- Automatic database migrations on startup
- Comprehensive logging middleware
- Request/response monitoring

## Scaling

To scale the backend service:

1. Go to your service in Northflank Dashboard
2. Navigate to Scaling settings
3. Adjust CPU, Memory, and replica count as needed

## Troubleshooting

### Common Issues:

1. **Database connection failed**
   - Check if database service is healthy
   - Verify `DATABASE_URL` format
   - Ensure network connectivity between services

2. **Application won't start**
   - Check logs in Northflank Dashboard
   - Verify all required environment variables are set
   - Ensure port 8000 is not already in use

3. **Health check failures**
   - Verify the `/health` endpoint is accessible
   - Check if the application is fully started
   - Review startup logs for errors

### Viewing Logs

```bash
# View service logs
northflank logs --service videostack-backend

# View database logs
northflank logs --service videostack-db
```

## Update Deployment

To update your deployment:

```bash
# Redeploy with latest changes
northflank deploy --file northflank.yaml

# Or update specific service
northflank redeploy --service videostack-backend
```

## Cost Optimization

- Start with minimal resources (1 CPU, 2GB RAM)
- Monitor performance and scale as needed
- Use SSD storage for better performance
- Enable auto-scaling based on CPU/memory usage
