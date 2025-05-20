Réseau Social

Objectifs

Vous devrez créer un réseau social similaire à Facebook qui contiendra les fonctionnalités suivantes :

    Abonnés
    Profil
    Publications
    Groupes
    Notifications
    Chats

Instructions

Frontend

Le développement frontend est l'art de créer des sites et des applications web qui s'affichent côté "client". Il inclut tout ce que les utilisateurs expérimentent directement : couleurs et styles de texte, images, graphiques et tableaux, boutons, couleurs, et menus de navigation. Il se concentre sur l'envoi de requêtes au backend pour obtenir des données spécifiques ou envoyer des données à stocker sur le backend.

HTML, CSS et JavaScript sont les langages utilisés pour le développement frontend. La réactivité et la performance sont deux objectifs principaux du frontend. Des frameworks frontend peuvent être utilisés pour simplifier le travail du développeur.

Framework

Vous devrez utiliser un framework JS. C'est à vous de choisir lequel utiliser.

Les frameworks vous aideront à organiser et implémenter les fonctionnalités que vous souhaitez dans votre projet, afin de réaliser plus de travail de manière plus facile et plus rapide.

Parmi les frameworks JS les plus connus, on trouve :

    Next.js
    Vue.js
    Svelte
    Mithril

Attention : Notez que les frameworks JS sont différents des bibliothèques JS. Les bibliothèques JS contiennent des extraits de code utilisés pour effectuer des fonctions JavaScript courantes, tandis que les frameworks vous aident en posant les bases de votre projet JS.

Backend

Le backend englobe toutes les technologies nécessaires pour traiter les requêtes entrantes et générer et envoyer des réponses au client. Il est généralement divisé en trois parties principales :

    Serveur : c'est l'ordinateur qui reçoit les requêtes. Il sert de point d'entrée pour toutes les requêtes entrantes. Bien qu'il existe des machines spécialisées pour cet usage, vous pouvez utiliser votre propre ordinateur comme serveur.

    Application : c'est l'application qui s'exécute sur le serveur, écoute les requêtes, récupère les informations de la base de données et envoie des réponses. C'est ici que réside la logique principale de votre réseau social. Elle contient la logique pour gérer diverses requêtes basées sur HTTP ou d'autres protocoles. Certaines de ces fonctions sont appelées middlewares, qui s'exécutent entre la réception d'une requête et l'envoi d'une réponse.

    Base de données : comme vous le savez peut-être déjà, la base de données est utilisée pour organiser et stocker des données. De nombreuses requêtes envoyées au serveur impliquent des interrogations de la base de données. Les clients peuvent demander des informations stockées dans la base de données ou soumettre des données à y ajouter.

Application

Le backend peut consister, comme mentionné ci-dessus, en une application contenant toute la logique backend. Cette logique comprendra donc plusieurs middlewares, par exemple :

    Authentification : puisque HTTP est un protocole sans état, nous pouvons utiliser plusieurs méthodes pour authentifier un client/utilisateur. Vous devez utiliser des sessions et des cookies.
    Gestion des images : prise en charge de divers types d'extensions. Dans ce projet, vous devez gérer au moins les types JPEG, PNG et GIF. Vous devrez stocker les images, ce qui peut être fait en stockant le fichier/chemin dans la base de données et en sauvegardant l'image dans un système de fichiers spécifique.
    Websocket : gestion des connexions en temps réel entre les clients. Cela aidera pour les chats privés.

Pour le serveur web, vous pouvez regarder Caddy, qui peut servir votre site, services et applications et est écrit en Go. Ou vous êtes libre de créer votre propre serveur web.

SQLite

Pour stocker les données de votre réseau social, vous utiliserez la bibliothèque de base de données SQLite. Pour structurer votre base de données et obtenir de meilleures performances, nous vous conseillons vivement de regarder le diagramme entité-relation et d'en créer un basé sur votre propre base de données.

Pour en savoir plus sur SQLite, vous pouvez consulter la page SQLite.

Migrations

Vous devrez créer des migrations pour ce projet afin que chaque fois que l'application s'exécute, elle crée les tables spécifiques pour que le projet fonctionne correctement.

Pour cela, concentrez-vous sur une structure de dossiers similaire à celle-ci :

student$ tree .
backend
├── pkg
│   ├── db
│   │   ├── migrations
│   │   │   └── sqlite
│   │   │       ├── 000001_create_users_table.down.sql
│   │   │       ├── 000001_create_users_table.up.sql
│   │   │       ├── 000002_create_posts_table.down.sql
│   │   │       └── 000002_create_posts_table.up.sql
│   │   └── sqlite
│   │       └── sqlite.go
│   └── ...other_pkgs.go
└── server.go

La structure de dossiers est organisée de manière à vous aider à comprendre et utiliser les migrations, que vous pouvez appliquer en utilisant un simple chemin, par exemple : file://backend/pkg/db/migrations/sqlite. Elle peut être organisée comme vous le souhaitez, mais n'oubliez pas que l'application des migrations et l'organisation des fichiers seront testées.

Pour les migrations, vous pouvez utiliser le package golang-migrate ou un autre package qui convient mieux à votre projet.

Toutes les migrations doivent être stockées dans un dossier spécifique, comme ci-dessus. Le fichier sqlite.go doit présenter la connexion à la base de données, l'application des migrations et d'autres fonctionnalités utiles que vous pourriez avoir besoin d'implémenter.

Ce système de migration peut vous aider à gérer votre temps et les tests en remplissant votre base de données.

Docker

Conteneurisation du Backend et du Frontend

Votre projet doit consister en deux images Docker, une pour le backend et une autre pour le frontend. Chacun de ces conteneurs sert un but spécifique et communique avec l'autre pour fournir une application de réseau social fonctionnelle.

Conteneur Backend :

Créez une image Docker pour le backend de votre application de réseau social. Ce conteneur exécutera la logique côté serveur de votre application, gérera les requêtes des clients et interagira avec la base de données.

Conteneur Frontend :

Créez une image Docker pour le frontend de votre application de réseau social. Ce conteneur servira le code côté client, comme les fichiers HTML, CSS et JavaScript, aux navigateurs des utilisateurs. Il communiquera également avec le backend via des requêtes HTTP.

Conseils :

    Nommez votre image Docker frontend de manière appropriée.
    Assurez-vous que le conteneur backend expose les ports nécessaires pour la communication avec le frontend et les clients externes, et que le conteneur frontend expose le port approprié pour servir le contenu frontend aux navigateurs des utilisateurs.

Authentification

Pour que les utilisateurs puissent utiliser le réseau social, ils devront créer un compte. Vous devrez donc créer un formulaire d'inscription et de connexion. Pour s'inscrire, chaque utilisateur doit fournir au moins :

    Email
    Mot de passe
    Prénom
    Nom
    Date de naissance
    Avatar/Image (facultatif)
    Surnom (facultatif)
    À propos de moi (facultatif)

Notez que l'Avatar/Image, le Surnom et À propos de moi doivent être présents dans le formulaire, mais l'utilisateur peut choisir de ne pas les remplir.

Lorsque l'utilisateur se connecte, il doit rester connecté jusqu'à ce qu'il choisisse une option de déconnexion qui doit être disponible à tout moment. Pour cela, vous devrez implémenter des sessions et des cookies.

Vous pouvez implémenter votre propre package pour les sessions et les cookies ou consulter certains packages pour vous aider.

Abonnés

Lors de la navigation sur le réseau social, l'utilisateur doit pouvoir suivre et ne plus suivre d'autres utilisateurs. Il va sans dire que pour ne plus suivre un utilisateur, il faut d'abord le suivre.

Concernant le suivi de quelqu'un, l'utilisateur doit initier cela en envoyant une demande de suivi à l'utilisateur souhaité. L'utilisateur destinataire peut alors choisir d'"accepter" ou de "refuser" la demande. Cependant, si l'utilisateur destinataire a un profil public (comme expliqué dans la section suivante), ce processus de demande et d'acceptation est contourné et l'utilisateur qui a envoyé la demande commence automatiquement à suivre l'utilisateur avec le profil public.

Profil

Chaque profil doit contenir :

    Informations de l'utilisateur (toutes les informations demandées dans le formulaire d'inscription à l'exception du mot de passe, bien sûr)
    Activité de l'utilisateur
        Toutes les publications faites par l'utilisateur
    Abonnés et utilisateurs suivis (afficher les utilisateurs qui suivent le propriétaire du profil et ceux qu'il suit)

Il existe deux types de profils : un profil public et un profil privé. Un profil public affichera les informations spécifiées ci-dessus à tous les utilisateurs du réseau social, tandis qu'un profil privé n'affichera ces mêmes informations qu'à ses abonnés uniquement.

Lorsque l'utilisateur est sur son propre profil, une option doit être disponible lui permettant de rendre son profil public ou privé.

Publications

Après s'être connecté, l'utilisateur peut créer des publications et commenter les publications déjà créées. Lors de la création d'une publication ou d'un commentaire, l'utilisateur peut inclure une image ou un GIF.

L'utilisateur doit pouvoir spécifier la confidentialité de la publication :

    publique (tous les utilisateurs du réseau social pourront voir la publication)
    presque privée (seuls les abonnés du créateur de la publication pourront voir la publication)
    privée (seuls les abonnés choisis par le créateur de la publication pourront la voir)

Groupes

Un utilisateur doit pouvoir créer un groupe. Le groupe doit avoir un titre et une description fournis par le créateur, et il peut inviter d'autres utilisateurs à rejoindre le groupe.

Les utilisateurs invités doivent accepter l'invitation pour faire partie du groupe. Ils peuvent également inviter d'autres personnes une fois qu'ils font déjà partie du groupe. Une autre façon d'entrer dans le groupe est de demander à en faire partie, et seul le créateur du groupe est autorisé à accepter ou refuser la demande.

Pour faire une demande d'entrée dans un groupe, l'utilisateur doit d'abord le trouver. Cela sera possible grâce à une section où l'on peut parcourir tous les groupes.

Lorsqu'il est dans un groupe, un utilisateur peut créer des publications et commenter les publications déjà créées. Ces publications et commentaires ne seront affichés qu'aux membres du groupe.

Un utilisateur appartenant au groupe peut également créer un événement, le rendant disponible pour les autres utilisateurs du groupe. Un événement doit avoir :

    Titre
    Description
    Jour/Heure
    2 Options (au moins) :
        Participe
        Ne participe pas

Après avoir créé l'événement, chaque utilisateur peut choisir l'une des options pour l'événement.

Chat

Les utilisateurs doivent pouvoir envoyer des messages privés à d'autres utilisateurs qu'ils suivent ou qui les suivent, en d'autres termes, au moins l'un des utilisateurs doit suivre l'autre.

Lorsqu'un utilisateur envoie un message, le destinataire le reçoit instantanément via WebSockets s'il suit l'expéditeur ou si le destinataire a un profil public.

Les utilisateurs doivent pouvoir s'envoyer des emojis.

Les groupes doivent avoir un salon de chat commun, donc si un utilisateur est membre du groupe, il doit pouvoir envoyer et recevoir des messages dans ce chat de groupe.

Notifications

Un utilisateur doit pouvoir voir les notifications sur chaque page du projet. Les nouvelles notifications doivent être différentes des nouveaux messages privés et doivent être affichées différemment !

Un utilisateur doit être notifié s'il :

    a un profil privé et qu'un autre utilisateur lui envoie une demande de suivi
    reçoit une invitation de groupe, afin qu'il puisse refuser ou accepter la demande
    est le créateur d'un groupe et qu'un autre utilisateur demande à rejoindre le groupe, afin qu'il puisse refuser ou accepter la demande
    est membre d'un groupe et qu'un événement est créé

Toute autre notification créée par vous qui ne figure pas dans la liste est également la bienvenue.

Packages Autorisés

    Les packages Go standard sont autorisés
    Gorilla WebSocket
    golang-migrate
    sql-migration
    migration
    sqlite3
    bcrypt
    gofrs/uuid ou google/uuid

Ce projet vous aidera à en apprendre davantage sur :

    Authentification :
        Sessions et cookies
    Utilisation et configuration de Docker :
        Conteneurisation d'une application
        Compatibilité/Dépendance
        Création d'images
    Langage SQL :
        Manipulation de bases de données
        Migrations
    Les bases du chiffrement
    WebSocket
