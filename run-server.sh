#!/bin/bash
while true; do
  echo "Starting server..."
  npx tsx server/index.ts
  echo "Server stopped, restarting in 2 seconds..."
  sleep 2
done