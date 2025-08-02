#!/bin/bash

# Script pour peupler la base de données avec des données de test
# Usage: ./seed_database.sh

DB_PATH="./backend/database/sqlite/data.db"
SEED_SCRIPT="./backend/database/sqlite/seed_data.sql"

echo "🌱 Peuplement de la base de données avec des données de test..."

# Vérifier si la base de données existe
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Erreur: La base de données $DB_PATH n'existe pas."
    echo "Assurez-vous que les migrations ont été exécutées en premier."
    exit 1
fi

# Vérifier si le script SQL existe
if [ ! -f "$SEED_SCRIPT" ]; then
    echo "❌ Erreur: Le script $SEED_SCRIPT n'existe pas."
    exit 1
fi

# Exécuter le script SQL
echo "📝 Exécution du script de peuplement..."
sqlite3 "$DB_PATH" < "$SEED_SCRIPT"

if [ $? -eq 0 ]; then
    echo "✅ Base de données peuplée avec succès !"
    echo ""
    echo "👤 Utilisateur principal créé:"
    echo "   Email: nono@gmail.com"
    echo "   Mot de passe: password1234"
    echo "   Username: nono"
    echo ""
    echo "🔗 Relations de suivi créées entre les utilisateurs"
    echo "📊 Consultez les statistiques affichées ci-dessus"
else
    echo "❌ Erreur lors du peuplement de la base de données"
    exit 1
fi
