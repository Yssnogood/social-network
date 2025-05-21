#!/bin/bash

# Couleurs pour la lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Compilation pour développement local sur Mac${NC}"

# Vérifier si les dépendances sont installées
if ! command -v go &> /dev/null; then
    echo -e "${RED}Go n'est pas installé. Veuillez l'installer via Homebrew:${NC}"
    echo "brew install go"
    exit 1
fi

if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}SQLite n'est pas installé. Veuillez l'installer via Homebrew:${NC}"
    echo "brew install sqlite"
    exit 1
fi

# Afficher la version de Go et les variables d'environnement
echo -e "${YELLOW}Informations sur Go:${NC}"
go version
echo -e "${YELLOW}GOPATH=${NC}$GOPATH"
echo -e "${YELLOW}GOROOT=${NC}$GOROOT"

# Créer les répertoires nécessaires s'ils n'existent pas
mkdir -p backend/database/sqlite

# Vérifier si main.go existe
if [ ! -f backend/cmd/server/main.go ]; then
    echo -e "${RED}Le fichier main.go est introuvable à l'emplacement backend/cmd/server/main.go${NC}"
    echo -e "${YELLOW}Structure actuelle du projet:${NC}"
    find . -type f -name "*.go" | grep -v "/vendor/" | sort
    exit 1
fi

# Vérifier les dépendances Go
echo -e "${YELLOW}Vérification des dépendances Go...${NC}"
go mod tidy
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de la vérification des dépendances${NC}"
    exit 1
fi

# Compiler l'application backend avec verbosité
echo -e "${YELLOW}Compilation du backend (mode verbeux)...${NC}"
export CGO_ENABLED=1
go build -v -o backend-app ./backend/cmd/server/main.go
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de la compilation du backend${NC}"
    exit 1
fi

echo -e "${GREEN}Backend compilé avec succès: ./backend-app${NC}"

# Vérifier si .env existe, sinon le créer
if [ ! -f .env ]; then
    echo -e "${YELLOW}Création du fichier .env...${NC}"
    echo "DB_PATH=backend/database/sqlite/data.db" > .env
    echo "PORT=8080" >> .env
    echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env
    echo -e "${GREEN}Fichier .env créé${NC}"
fi

echo -e "${YELLOW}Installation des dépendances frontend...${NC}"
if [ -d frontend ]; then
    cd frontend || exit
    if [ -f package.json ]; then
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Erreur lors de l'installation des dépendances frontend${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Aucun fichier package.json trouvé dans le dossier frontend${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}Le dossier frontend n'existe pas${NC}"
fi

echo -e "${GREEN}Tout est prêt!${NC}"
echo -e "Pour démarrer le backend: ${YELLOW}./backend-app${NC}"
echo -e "Pour démarrer le frontend: ${YELLOW}cd frontend && npm run dev${NC}"