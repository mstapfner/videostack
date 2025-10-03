# VideoStack Monorepo

A monorepo containing multiple Python services for the VideoStack application, with PostgreSQL database support.

## Project Structure

```
videostack/
├── services/
│   ├── backend/           # API v1 - User management service
│   │   ├── app/
│   │   │   └── main.py    # FastAPI application
│   │   ├── Dockerfile     # Container configuration
│   │   └── requirements.txt # Python dependencies
│   └── api-v2/            # API v2 - Video management service
│       ├── main.py        # FastAPI application
│       ├── Dockerfile     # Container configuration
│       └── requirements.txt # Python dependencies
├── docker-compose.yml     # Multi-service orchestration
└── README.md             # This file
```

## Services

### Backend (API v1)
- **Port**: 8000
- **Purpose**: User management and authentication
- **Endpoints**:
  - `GET /` - Welcome message
  - `GET /health` - Health check
  - `POST /users/` - Create user
  - `GET /users/{user_id}` - Get user

### API v2
- **Port**: 8001
- **Purpose**: Video management and processing
- **Endpoints**:
  - `GET /` - Welcome message
  - `GET /health` - Health check
  - `POST /videos/` - Create video
  - `GET /videos/` - List videos
  - `GET /videos/{video_id}` - Get video

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the services:**
   - API v1: http://localhost:8000
   - API v2: http://localhost:8001
   - API v1 Docs: http://localhost:8000/docs
   - API v2 Docs: http://localhost:8001/docs

3. **Database connection:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `videostack`
   - User: `videostack_user`
   - Password: `videostack_password`

## Database

- **PostgreSQL 15** with persistent data storage
- Tables are created automatically on first run
- Data persists across container restarts

## Development

Each service can be developed independently:

```bash
# Start only the database
docker-compose up db

# Start only backend service
docker-compose up backend

# Start only API v2 service
docker-compose up api-v2

# View logs
docker-compose logs -f [service_name]
```

## Environment Variables

The following environment variables can be customized:

- `POSTGRES_DB` - Database name (default: videostack)
- `POSTGRES_USER` - Database user (default: videostack_user)
- `POSTGRES_PASSWORD` - Database password (default: videostack_password)
- `DATABASE_URL` - Full database connection string

## Adding New Services

1. Create a new directory under `services/`
2. Add a `Dockerfile` and `requirements.txt`
3. Create your Python application
4. Update `docker-compose.yml` to include the new service

## Troubleshooting

- **Port conflicts**: Ensure ports 8000, 8001, and 5432 are available
- **Database connection issues**: Check that the database container is healthy before starting services
- **Build failures**: Ensure all service directories have proper `.dockerignore` files
