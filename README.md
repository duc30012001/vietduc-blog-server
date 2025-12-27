## � Docker

Run the application using Docker Compose:

```bash
# Start the application
docker compose up --build

# Run in background
docker compose up -d

# Dev
docker compose -f docker-compose.dev.yml up --build -d

# Prod
docker compose -f docker-compose.prod.yml up --build -d
```
