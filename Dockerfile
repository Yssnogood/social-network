# Étape 1 : build
FROM golang:1.24.3-alpine AS builder
WORKDIR /app

# Installer dépendances pour CGO et SQLite
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copier go.mod/go.sum et télécharger dépendances
COPY go.mod go.sum ./
RUN go mod download

# Copier le code backend et migrations
COPY backend/ ./backend/
COPY backend/database/migrations ./backend/database/migrations

# Copier le .env interne
COPY .env ./

# Activer CGO et compiler
ENV CGO_ENABLED=1
RUN go build -o server ./backend/cmd/server

# Étape 2 : image finale légère
FROM alpine:3.18
WORKDIR /app

# Installer sqlite runtime
RUN apk add --no-cache sqlite

# Créer dossier pour SQLite et migrations
RUN mkdir -p /app/backend/database/sqlite
RUN chmod -R 777 /app/backend/database/sqlite

# Copier binaire, migrations et .env
COPY --from=builder /app/server .
COPY --from=builder /app/.env ./
COPY --from=builder /app/backend/database/migrations ./backend/database/migrations

EXPOSE 8080
CMD ["./server"]
