# Northflank Deployment Guide

This document explains how to deploy the VideoStack backend service to Northflank.

## Prerequisites

1. A Northflank account and project
2. The following secrets configured in your Northflank project:
   - `DATABASE_URL` - PostgreSQL connection string
   - `DB_PASSWORD` - Database password
   - `WORKOS_CLIENT_ID` - WorkOS client ID
   - `WORKOS_API_KEY` - WorkOS API key
   - `OPENAI_API_KEY` - OpenAI API key
   - `GROQ_API_KEY` - Groq API key
   - `RUNWARE_API_KEY` - Runware API key

## Deployment Configuration

The `northflank.yaml` file in this directory contains the complete deployment configuration for:

- **Backend Service**: FastAPI application running on port 8000
- **PostgreSQL Database**: Version 15 with automated backups

## Deployment Steps

### 1. Connect Repository to Northflank

1. Log into your Northflank dashboard
2. Create a new project or select an existing one
3. Go to "Services" and click "Add Service"
4. Choose "Git Repository" as the source
5. Connect your Git repository containing this backend service
6. Select the branch you want to deploy (typically `main`)

### 2. Configure Build Settings

- **Build Context**: `.` (root of the repository)
- **Dockerfile Path**: `services/backend/Dockerfile`
- **Build Configuration File**: `services/backend/northflank.yaml`

### 3. Set Environment Variables

Ensure all required secrets are configured in your Northflank project settings under "Secrets & Config":

```
DATABASE_URL=postgresql://videostack_user:your_password@your_host:5432/videostack
DB_PASSWORD=your_database_password
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_API_KEY=your_workos_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
RUNWARE_API_KEY=your_runware_api_key
```

### 4. Deploy

1. Click "Deploy Service" in Northflank
2. Monitor the deployment logs
3. Once deployed, the service will be available at the provided Northflank domain

## Service Configuration

### Backend Service Features

- **Port**: 8000
- **Health Check**: HTTP GET on `/` every 10 seconds
- **Resources**: 1 CPU core, 2GB RAM
- **Database**: Integrated PostgreSQL 15 with daily backups
- **Security**: Non-root user execution

### Database Configuration

- **Version**: PostgreSQL 15
- **Storage**: 10GB
- **Backups**: Daily at 2 AM UTC, 7-day retention
- **High Availability**: Single replica (can be upgraded)

## Production Optimizations

The Dockerfile includes several production optimizations:

- **Multi-stage build**: Not used (single stage for simplicity)
- **Minimal dependencies**: Only essential packages installed
- **Non-root user**: Application runs as non-privileged user
- **Performance**: Uses `uvloop` for better async performance
- **Security**: Minimal attack surface

## Monitoring and Logs

- Application logs are available in the Northflank dashboard
- Database logs can be accessed through the database service dashboard
- Health checks ensure service availability

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` secret is correctly formatted
   - Check database credentials in Northflank secrets

2. **Build Failures**
   - Ensure all required Python packages are in `requirements.txt`
   - Check that `.dockerignore` doesn't exclude necessary files

3. **Runtime Errors**
   - Verify all API keys are properly set in secrets
   - Check application logs in Northflank dashboard

### Getting Help

- Check Northflank documentation: https://docs.northflank.com/
- Review application logs in the Northflank dashboard
- Ensure all environment variables match your local development setup

## Scaling

To scale the application:

1. In Northflank dashboard, go to your service
2. Navigate to "Deployment" settings
3. Increase replica count as needed
4. Enable autoscaling if desired (currently disabled)

## Costs

- **Backend Service**: ~$10-20/month depending on usage
- **Database**: ~$15-30/month for 10GB PostgreSQL
- **Bandwidth**: Pay-per-use for outbound traffic

Check Northflank pricing for current rates.
