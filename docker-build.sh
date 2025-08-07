#!/bin/bash

# Build and run the Docker container

echo "Building Docker image..."
docker build -t freight-bidding-app .

echo "Running container on port 3000..."
docker run -d -p 3000:80 --name freight-app freight-bidding-app

echo "App is running at http://localhost:3000"
echo "To stop: docker stop freight-app"
echo "To remove: docker rm freight-app"