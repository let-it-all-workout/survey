#!/bin/bash

echo "Starting Survey Application..."
echo ""
echo "Starting backend server..."
cd server && npm start &
BACKEND_PID=$!

sleep 2

echo "Starting frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend running on http://localhost:3001"
echo "Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
