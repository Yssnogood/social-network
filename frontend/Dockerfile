# Étape 1 : build
FROM node:20-alpine AS builder
WORKDIR /app

# Copier package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code
COPY . ./

# Build du projet Next.js
RUN npm run build

# Étape 2 : image finale
FROM node:20-alpine
WORKDIR /app

# Copier tout depuis l'étape builder
COPY --from=builder /app ./

# Exposer le port pour Next.js
EXPOSE 3000

# Lancer le serveur Next.js
CMD ["npm", "start"]
