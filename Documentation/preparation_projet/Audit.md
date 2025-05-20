Fonctionnel

    La contrainte concernant les packages autorisés a-t-elle été respectée ?

Ouverture du Projet

    +   En examinant le système de fichiers du backend, avez-vous trouvé une structure bien organisée, similaire à l'exemple fourni dans le sujet, avec une séparation claire des dossiers de packages et de migrations ?
    +   Le système de fichiers pour le frontend est-il bien organisé ?

Backend

    +   Le backend comprend-il une séparation claire des responsabilités entre ses trois parties principales : Serveur, Application et Base de données ?
    +   Y a-t-il un serveur qui reçoit efficacement les requêtes entrantes et sert de point d'entrée pour toutes les requêtes de l'application ?
    +   L'application (App) s'exécutant sur le serveur écoute-t-elle efficacement les requêtes, récupère-t-elle les informations de la base de données et envoie-t-elle des réponses ?
    +   La logique principale du réseau social est-elle implémentée dans le composant App, y compris la logique de gestion des différents types de requêtes basées sur HTTP ou d'autres protocoles ?

Base de Données

    +   SQLite est-il utilisé comme base de données dans le projet ?
    +   Les clients peuvent-ils demander des informations stockées dans la base de données et soumettre des données à y ajouter sans rencontrer d'erreurs ou de problèmes ?
    +   L'application implémente-t-elle un système de migration ?
    +   Ce système de fichiers de migration est-il bien organisé (comme l'exemple du sujet) ?
    +   Démarrez l'application de réseau social, puis entrez dans la base de données en utilisant la commande sqlite3 <database_name.db>.
    +   Les migrations sont-elles appliquées par le système de migration ?

Authentification

    +   L'application implémente-t-elle des sessions pour l'authentification des utilisateurs ?
    +   Les éléments de formulaire corrects sont-ils utilisés lors de l'inscription ? (Email, Mot de passe, Prénom, Nom, Date de naissance, Avatar/Image (facultatif), Surnom (facultatif), À propos de moi (facultatif))
    +   Essayez d'inscrire un utilisateur.
    +   Lors de l'inscription, l'application a-t-elle correctement enregistré l'utilisateur dans la base de données sans erreurs ?
    +   Essayez de vous connecter avec l'utilisateur que vous venez d'inscrire.
    +   Lors de la tentative de connexion avec l'utilisateur que vous venez d'inscrire, le processus de connexion a-t-il fonctionné sans problème ?
    +   Essayez de vous connecter avec l'utilisateur que vous avez créé, mais avec un mauvais mot de passe ou email.
    +   L'application a-t-elle correctement détecté et répondu aux identifiants de connexion incorrects ?
    +   Essayez d'inscrire le même utilisateur que vous avez déjà inscrit.
    +   L'application a-t-elle détecté si l'email/utilisateur est déjà présent dans la base de données ?
    +   Ouvrez deux navigateurs (par exemple : Chrome et Firefox), connectez-vous à l'un et actualisez l'autre.
    +   Pouvez-vous confirmer que le navigateur non connecté reste non enregistré ?
    +   En utilisant les deux navigateurs, connectez-vous avec des utilisateurs différents dans chacun. Ensuite, actualisez les deux navigateurs.
    +   Pouvez-vous confirmer que les deux navigateurs restent connectés avec les bons utilisateurs ?

Abonnés

    +   Essayez de suivre un utilisateur privé.
    +   Pouvez-vous envoyer une demande de suivi à l'utilisateur privé ?
    +   Essayez de suivre un utilisateur public.
    +   Pouvez-vous suivre l'utilisateur public sans avoir besoin d'envoyer une demande de suivi ?
    +   Ouvrez deux navigateurs (par exemple : Chrome et Firefox), connectez-vous en tant que deux utilisateurs privés différents et avec l'un d'eux, essayez de suivre l'autre.
    +   L'utilisateur qui a reçu la demande peut-il accepter ou refuser la demande de suivi ?
    +   Après avoir suivi un autre utilisateur avec succès, essayez de ne plus le suivre.
    +   Avez-vous pu le faire ?

Profil

    +   Essayez d'ouvrir votre propre profil.
    +   Le profil affiche-t-il toutes les informations demandées dans le formulaire d'inscription, à l'exception du mot de passe ?
    +   Essayez d'ouvrir votre propre profil.
    +   Le profil affiche-t-il tous les posts créés par l'utilisateur ?
    +   Essayez d'ouvrir votre propre profil.
    +   Le profil affiche-t-il les utilisateurs que vous suivez et ceux qui vous suivent ?
    +   Essayez d'ouvrir votre propre profil.
    +   Pouvez-vous basculer entre un profil privé et un profil public ?
    +   Ouvrez deux navigateurs et connectez-vous avec des utilisateurs différents, l'un des utilisateurs ayant un profil privé et suivant cet utilisateur avec succès.
    +   Pouvez-vous voir le profil privé d'un utilisateur suivi ?
    +   En utilisant les deux navigateurs avec les mêmes utilisateurs, assurez-vous de ne pas suivre l'utilisateur ayant un profil privé.
    +   Êtes-vous empêché de voir le profil privé d'un utilisateur non suivi ?
    +   En utilisant les deux navigateurs avec les utilisateurs, assurez-vous de ne pas suivre l'utilisateur ayant un profil public.
    +   Pouvez-vous voir le profil public d'un utilisateur non suivi ?
    +   En utilisant les deux navigateurs avec les utilisateurs, assurez-vous de suivre l'utilisateur ayant un profil public.
    +   Pouvez-vous voir le profil public d'un utilisateur suivi ?

Publications

    +   Pouvez-vous créer une publication et commenter des publications existantes après vous être connecté ?
    +   Essayez de créer une publication.
    +   Pouvez-vous inclure une image (JPG ou PNG) ou un GIF ?
    +   Essayez de créer un commentaire.
    +   Pouvez-vous inclure une image (JPG ou PNG) ou un GIF ?
    +   Essayez de créer une publication.
    +   Pouvez-vous spécifier le type de confidentialité de la publication (publique, presque privée, privée) ?
    +   Si vous choisissez l'option de confidentialité privée, pouvez-vous spécifier les utilisateurs autorisés à voir la publication ?

Groupes

    +   Essayez de créer un groupe.
    +   Avez-vous pu inviter l'un de vos abonnés à rejoindre le groupe ?
    +   Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur, suivez-vous mutuellement et avec l'un des utilisateurs, créez un groupe et invitez l'autre utilisateur.
    +   L'autre utilisateur a-t-il reçu une invitation de groupe qu'il peut refuser/accepter ?
    +   En utilisant les mêmes navigateurs et les mêmes utilisateurs, avec l'un des utilisateurs, créez un groupe et avec l'autre, essayez de faire une demande d'entrée dans le groupe.
    +   Le créateur du groupe a-t-il reçu une demande qu'il peut refuser/accepter ?
    +   Un utilisateur peut-il inviter d'autres personnes dans le groupe après en être devenu membre (l'utilisateur étant différent du créateur du groupe) ?
    +   Un utilisateur peut-il faire une demande d'entrée dans un groupe ?
    +   Après être devenu membre d'un groupe, l'utilisateur peut-il créer des publications et commenter les publications déjà créées ?
    +   Essayez de créer un événement dans un groupe.
    +   Vous a-t-on demandé un titre, une description, une date/heure et au moins deux options (participe, ne participe pas) ?
    +   En utilisant les mêmes navigateurs et les mêmes utilisateurs, après qu'ils soient tous deux devenus membres du même groupe, créez un événement avec l'un d'eux.
    +   L'autre utilisateur peut-il voir l'événement et voter pour l'option qu'il souhaite ?

Chat

    +   Essayez d'ouvrir deux navigateurs (par exemple : Chrome et Firefox), connectez-vous avec des utilisateurs différents dans chacun. Ensuite, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'autre utilisateur.
    +   L'autre utilisateur a-t-il reçu le message en temps réel ?
    +   Essayez d'ouvrir deux navigateurs (par exemple : Chrome et Firefox), connectez-vous avec des utilisateurs différents qui ne se suivent pas du tout. Ensuite, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'autre utilisateur.
    +   Pouvez-vous confirmer qu'il n'a pas été possible de créer un chat entre ces deux utilisateurs ?
    +   En utilisant les deux navigateurs avec les utilisateurs, commencez un chat entre eux.
    +   Le chat entre les utilisateurs s'est-il bien déroulé (n'a pas planté le serveur) ?
    +   Essayez d'ouvrir trois navigateurs (par exemple : Chrome et Firefox ou un navigateur privé), connectez-vous avec des utilisateurs différents dans chacun. Ensuite, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'un des autres utilisateurs.
    +   Seul l'utilisateur ciblé a-t-il reçu le message ?
    +   En utilisant les trois navigateurs avec les utilisateurs, entrez avec chaque utilisateur dans un groupe commun. Ensuite, commencez à envoyer des messages dans le salon de chat commun en utilisant l'un des utilisateurs.
    +   Tous les utilisateurs du groupe ont-ils reçu le message en temps réel ?
    +   En utilisant les trois navigateurs avec les utilisateurs, continuez à discuter entre les utilisateurs dans le groupe.
    +   Le chat entre les utilisateurs s'est-il bien déroulé (n'a pas planté le serveur) ?
    +   Pouvez-vous confirmer qu'il est possible d'envoyer des emojis via le chat à d'autres utilisateurs ?

Notifications

    +   Pouvez-vous vérifier les notifications sur chaque page du projet ?
    +   Ouvrez deux navigateurs, connectez-vous en tant que deux utilisateurs privés différents et avec l'un d'eux, essayez de suivre l'autre.
    +   L'autre utilisateur a-t-il reçu une notification concernant la demande de suivi ?
    +   Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur, suivez-vous mutuellement et avec l'un des utilisateurs, créez un groupe et invitez l'autre utilisateur.
    +   L'utilisateur invité a-t-il reçu une notification concernant l'invitation de groupe ?
    +   Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur, créez un groupe avec l'un d'eux et avec l'autre, envoyez une demande d'entrée dans le groupe.
    +   L'autre utilisateur a-t-il reçu une notification concernant la demande d'entrée dans le groupe ?
    +   Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur, devenez membres du même groupe avec les deux utilisateurs et avec l'un des utilisateurs, créez un événement.
    +   L'autre utilisateur a-t-il reçu une notification concernant la création de l'événement ?

Docker

    +   Essayez d'exécuter l'application et utilisez la commande Docker docker ps -a.
    +   Pouvez-vous confirmer qu'il y a deux conteneurs (backend et frontend), et que les deux conteneurs ont des tailles non nulles, indiquant qu'ils ne sont pas vides ?
    +   Essayez d'accéder à l'application de réseau social via votre navigateur web.
    +   Avez-vous pu accéder à l'application de réseau social via votre navigateur web après avoir exécuté les conteneurs Docker, confirmant que les conteneurs fonctionnent et servent l'application comme prévu ?

Bonus

    +   Pouvez-vous vous connecter en utilisant GitHub ou un autre type d'authentificateur externe (norme ouverte pour la délégation d'accès) ?
    +   L'étudiant a-t-il créé une migration pour remplir la base de données ?
    +   Si vous ne suivez plus un utilisateur, recevez-vous une fenêtre contextuelle de confirmation ?
    +   Si vous changez votre profil de public à privé (ou vice versa), recevez-vous une fenêtre contextuelle de confirmation ?
    +   Y a-t-il d'autres notifications en plus de celles explicitement mentionnées dans le sujet ?
    +   Le projet présente-t-il un script pour construire les images et les conteneurs (utilisation d'un script pour simplifier la construction) ?
    +   Pensez-vous que ce projet est globalement bien réalisé ?
