#!/bin/bash

echo "Social Network - Démarrage sans Docker"

# Fonction pour arrêter tous les processus au CTRL+C
cleanup() {
    echo "Arrêt des processus..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Capture du CTRL+C pour arrêter proprement
trap cleanup SIGINT

# Démarrage du backend
echo "Démarrage du backend..."
cd backend
go run cmd/server/main.go &
BACKEND_PID=$!
cd ..

# Démarrage du frontend
echo "Démarrage du frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Services démarrés !"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8090"
echo "Appuyez sur CTRL+C pour arrêter les services"

# Attente infinie (jusqu'au CTRL+C)
wait 