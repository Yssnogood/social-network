# Social Network - Documentation Docker

## Présentation

Ce projet est une application de réseau social composée d'un backend Go et d'un frontend Next.js, tous deux conteneurisés avec Docker pour faciliter le développement et le déploiement.

## Prérequis

- Docker
- Docker Compose
- Git

## Structure du projet

```
.
├── backend/              # Code source du backend Go
├── frontend/             # Code source du frontend Next.js
├── docker-compose.yml    # Configuration des services Docker
├── Dockerfile.backend    # Configuration Docker pour le backend
├── Dockerfile.frontend   # Configuration Docker pour le frontend
└── dev.sh                # Script utilitaire pour le développement
```

## Démarrage rapide

Le script `dev.sh` permet de gérer facilement les conteneurs Docker :

```bash
# Démarrer les conteneurs
./dev.sh start

# Arrêter les conteneurs
./dev.sh stop

# Redémarrer les conteneurs
./dev.sh restart

# Lancer les migrations de base de données
./dev.sh migrate

# Afficher les logs (tous les conteneurs)
./dev.sh logs

# Afficher les logs d'un conteneur spécifique
./dev.sh logs backend
./dev.sh logs frontend
```

## Services

### Backend

- **Technologies** : Go, SQLite
- **Port** : 8090
- **URL** : http://localhost:8090
- **API Principal** : http://localhost:8090/api

### Frontend

- **Technologies** : Next.js, React
- **Port** : 3000
- **URL** : http://localhost:3000

## Configuration

### Variables d'environnement

Les variables d'environnement sont définies dans le fichier `docker-compose.yml` :

#### Backend
- `DB_PATH` : Chemin vers la base de données SQLite
- `PORT` : Port sur lequel le serveur backend écoute (8090)
- `ALLOWED_ORIGINS` : Origines autorisées pour les requêtes CORS

#### Frontend
- `NEXT_PUBLIC_API_URL` : URL de l'API backend

## Volumes

Le projet utilise les volumes Docker suivants :

- `./backend/database/sqlite:/app/backend/database/sqlite` : Persistance de la base de données SQLite
- `./uploads:/app/uploads` : Stockage des fichiers uploadés

## Développement

Pour contribuer au développement :

1. Clonez le dépôt
2. Lancez les conteneurs avec `./dev.sh start`
3. Développez sur votre machine locale
4. Les changements dans le frontend sont appliqués à chaud
5. Pour les changements dans le backend, redémarrez les conteneurs avec `./dev.sh restart`

## Dépannage

**Problème de connexion au backend**
- Vérifiez que le backend est accessible sur http://localhost:8090
- Consultez les logs avec `./dev.sh logs backend`

**Problème de build du frontend**
- Vérifiez que les polices et dépendances sont correctement configurées
- Consultez les logs avec `./dev.sh logs frontend`

**Problème de port déjà utilisé**
- Arrêtez les autres applications qui pourraient utiliser les ports 3000 ou 8090
