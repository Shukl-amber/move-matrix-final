#!/bin/bash

# Check if MongoDB is already running
mongo_running=false
if nc -z localhost 27017 2>/dev/null; then
  echo "MongoDB is already running on port 27017"
  mongo_running=true
else
  # Start MongoDB in the background
  echo "Starting MongoDB..."
  mkdir -p ./data/db
  mongod --dbpath ./data/db &
  MONGO_PID=$!
  
  # Wait for MongoDB to start
  echo "Waiting for MongoDB to start..."
  max_tries=30
  count=0
  while ! nc -z localhost 27017 2>/dev/null; do
    sleep 1
    count=$((count+1))
    if [ $count -eq $max_tries ]; then
      echo "Failed to start MongoDB after $max_tries seconds"
      if [ ! -z "$MONGO_PID" ]; then
        kill $MONGO_PID
      fi
      exit 1
    fi
  done
  echo "MongoDB started successfully"
fi

# Seed the database with initial primitives (directly, without using API)
echo "Seeding database..."
npm run seed

# Start Next.js development server in the background
echo "Starting Next.js development server..."
npm run dev &
NEXT_PID=$!

# Wait for user to press Ctrl+C
echo ""
echo "Press Ctrl+C to stop the servers"
wait $NEXT_PID

# If we started MongoDB, stop it when the server is stopped
if [ "$mongo_running" = false ] && [ ! -z "$MONGO_PID" ]; then
  echo "Stopping MongoDB..."
  kill $MONGO_PID
fi 