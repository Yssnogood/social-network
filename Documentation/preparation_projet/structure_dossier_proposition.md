# Structure de dossiers recommandée

## Structure Backend (Go)

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Point d'entrée de l'application
├── pkg/
│   ├── api/                  # API REST
│   │   ├── handlers/         # Gestionnaires de requêtes HTTP
│   │   ├── middleware/       # Middlewares (auth, CORS, etc.)
│   │   └── routes/           # Configuration des routes
│   ├── config/               # Configuration de l'application
│   ├── db/
│   │   ├── migrations/       # Migrations pour la base de données
│   │   │   └── sqlite/
│   │   │       ├── 000001_create_users_table.down.sql
│   │   │       ├── 000001_create_users_table.up.sql
│   │   │       ├── 000002_create_posts_table.down.sql
│   │   │       └── 000002_create_posts_table.up.sql
│   │   ├── models/           # Modèles de données
│   │   ├── repositories/     # Accès aux données
│   │   └── sqlite/
│   │       └── sqlite.go     # Configuration SQLite
│   ├── domain/               # Entités métier et interfaces
│   ├── services/             # Logique métier
│   └── websocket/            # Gestion des WebSockets
│       ├── client.go         # Gestion des clients WebSocket
│       ├── hub.go            # Centre de distribution des messages
│       ├── channels.go       # Gestion des canaux de communication
│       └── message.go        # Définition des types de messages
├── internal/                 # Code interne à l'application
│   ├── auth/                 # Authentification et sessions
│   ├── utils/                # Utilitaires
│   └── validator/            # Validation des données
├── docs/                     # Documentation (Swagger/OpenAPI)
├── tests/                    # Tests
├── Dockerfile                # Configuration Docker
├── go.mod                    # Dépendances Go
└── go.sum                    # Sommes de contrôle des dépendances
```

## Structure Frontend (Next.js)

```
frontend/
├── public/                   # Fichiers statiques publics
│   ├── images/               # Images statiques
│   └── favicon.ico           # Favicon
├── src/
│   ├── app/                  # Utilisation de la structure App Router de Next.js
│   │   ├── api/              # Routes API
│   │   ├── auth/             # Pages d'authentification
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── profile/          # Pages de profil
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── edit/
│   │   │       └── page.tsx
│   │   ├── groups/           # Pages des groupes
│   │   ├── messages/         # Pages de messagerie
│   │   ├── notifications/    # Pages des notifications
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Page d'accueil
│   ├── components/           # Composants React
│   │   ├── common/           # Composants génériques
│   │   ├── auth/             # Composants d'authentification
│   │   ├── layout/           # Composants de mise en page
│   │   ├── posts/            # Composants liés aux publications
│   │   ├── groups/           # Composants liés aux groupes
│   │   ├── messages/         # Composants de messagerie
│   │   └── notifications/    # Composants de notifications
│   ├── hooks/                # Hooks personnalisés
│   ├── lib/                  # Bibliothèques et utilitaires
│   │   ├── api.ts            # Client API REST
│   │   ├── socket.ts         # Client WebSocket
│   │   └── utils.ts          # Fonctions utilitaires
│   ├── store/                # État global (Redux ou Context)
│   │   ├── auth/             # État d'authentification
│   │   ├── posts/            # État des publications
│   │   ├── messages/         # État des messages
│   │   └── notifications/    # État des notifications
│   ├── styles/               # Styles globaux
│   └── types/                # Types TypeScript
├── .env.local                # Variables d'environnement locales
├── next.config.js            # Configuration Next.js
├── package.json              # Dépendances
├── tsconfig.json             # Configuration TypeScript
└── Dockerfile                # Configuration Docker
```

## Structure Docker

```
docker-compose.yml           # Configuration des services Docker
.env                         # Variables d'environnement pour Docker
```

## Structure des migrations SQLite

```sql
-- 000001_create_users_table.up.sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    avatar_path TEXT,
    username TEXT,
    about_me TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 000001_create_users_table.down.sql
DROP TABLE IF EXISTS users;

-- 000002_create_posts_table.up.sql
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    privacy_type INTEGER NOT NULL DEFAULT 0, -- 0: public, 1: almost private, 2: private
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 000002_create_posts_table.down.sql
DROP TABLE IF EXISTS posts;

-- Autres migrations similaires pour les autres tables...
```