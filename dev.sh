#!/bin/bash

# Couleurs pour la lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Social Network - Outil de développement Docker${NC}"

function start_dev() {
    echo -e "${YELLOW}Démarrage des conteneurs en mode développement...${NC}"
    if docker-compose up -d; then
        echo -e "${GREEN}Les conteneurs sont démarrés!${NC}"
        echo -e "Frontend: http://localhost:3000"
        echo -e "Backend: http://localhost:8090"
    else
        echo -e "${RED}ERREUR: Impossible de démarrer les conteneurs.${NC}"
        exit 1
    fi
}

function stop_dev() {
    echo -e "${YELLOW}Arrêt des conteneurs...${NC}"
    docker-compose down
    echo -e "${GREEN}Conteneurs arrêtés.${NC}"
}

function run_migrations() {
    echo -e "${YELLOW}Exécution des migrations...${NC}"
    if docker exec social-network-backend ./main; then
        echo -e "${GREEN}Migrations terminées avec succès.${NC}"
    else
        echo -e "${RED}ERREUR: Échec des migrations.${NC}"
        exit 1
    fi
}

function show_logs() {
    if [ "$1" == "backend" ]; then
        docker logs -f social-network-backend
    elif [ "$1" == "frontend" ]; then
        docker logs -f social-network-frontend
    else
        docker-compose logs -f
    fi
}

case "$1" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        stop_dev
        start_dev
        ;;
    migrate)
        run_migrations
        ;;
    logs)
        show_logs $2
        ;;
    *)
        echo -e "Usage: $0 {start|stop|restart|migrate|logs [backend|frontend]}"
        exit 1
esac

exit 0