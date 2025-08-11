
# Trouver le PID
lsof -i :8090

# Supposons que le PID soit 12345
kill -9 12345

# Commandes Git principales

## Configuration initiale
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

## Initialisation d'un dépôt
git init

## Cloner un dépôt existant
git clone <url-du-depot>

## Opérations de base
git status
git add <fichier> # Ajouter un fichier spécifique
git add . # Ajouter tous les fichiers modifiés
git commit -m "Message de commit"
git log

## Gestion des branches
git branch # Lister les branches
git branch <nom-de-branche> # Créer une nouvelle branche
git checkout <nom-de-branche> # Basculer vers une branche
git merge <nom-de-branche> # Fusionner une branche dans la branche actuelle
git branch -d <nom-de-branche> # Supprimer une branche

## Collaboration
git remote add origin <url-du-depot> # Ajouter un dépôt distant
git push -u origin <nom-de-branche> # Pousser une branche vers le dépôt distant
git pull # Tirer les modifications depuis le dépôt distant
git fetch # Récupérer les modifications sans les fusionner

## Annuler des modifications
git reset <fichier> # Retirer un fichier de la zone de staging
git reset --hard # Réinitialiser l'index et l'arbre de travail
git revert <commit> # Créer un nouveau commit qui annule les modifications d'un commit précédent

# Commandes de base pour la gestion d'un serveur

## Mise à jour du système
sudo apt update # Mettre à jour la liste des paquets (Debian/Ubuntu)
sudo apt upgrade # Mettre à niveau les paquets installés

## Gestion des services
sudo systemctl start <nom-du-service> # Démarrer un service
sudo systemctl stop <nom-du-service> # Arrêter un service
sudo systemctl restart <nom-du-service> # Redémarrer un service
sudo systemctl enable <nom-du-service> # Activer un service au démarrage

## Gestion des utilisateurs
sudo adduser <nom-utilisateur> # Ajouter un nouvel utilisateur
sudo deluser <nom-utilisateur> # Supprimer un utilisateur
sudo usermod -aG sudo <nom-utilisateur> # Ajouter un utilisateur au groupe sudo

## Gestion des fichiers et répertoires
ls # Lister les fichiers et répertoires
cd <répertoire> # Changer de répertoire
mkdir <répertoire> # Créer un répertoire
rm <fichier> # Supprimer un fichier
rm -r <répertoire> # Supprimer un répertoire et son contenu
cp <source> <destination> # Copier un fichier ou un répertoire
mv <source> <destination> # Déplacer ou renommer un fichier ou un répertoire

## Gestion des permissions
chmod <permissions> <fichier> # Changer les permissions d'un fichier
chown <propriétaire>:<groupe> <fichier> # Changer le propriétaire et le groupe d'un fichier

## Surveillance du système
top # Afficher les processus en cours
df -h # Afficher l'espace disque disponible
free -m # Afficher l'utilisation de la mémoire



