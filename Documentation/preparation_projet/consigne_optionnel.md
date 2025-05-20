Application de Messagerie

Objectifs

Pour cette application de messagerie multiplateforme optionnelle, vous devrez implémenter une application de bureau en utilisant Electron.

Cette application de bureau doit avoir pour objectif principal la création d'une messagerie, similaire à Facebook ou Discord. Elle doit pouvoir fonctionner sur plusieurs plateformes : Windows, Linux et macOS.

Vous devrez créer :

    Un moyen de voir quels utilisateurs sont en ligne (disponibles pour discuter)
    Un moyen de notifier l'utilisateur dès qu'il reçoit un message
    Une communication en temps réel entre les utilisateurs qui discutent
    Une section pour les emojis, où les utilisateurs peuvent s'envoyer des emojis
    Une possibilité de mode hors ligne où l'utilisateur peut voir tous les messages de tous les utilisateurs, mais ne peut ni envoyer ni recevoir de messages. Vous devez informer l'utilisateur qu'il est hors ligne/en ligne
    Un moteur de recherche pour rechercher des messages

Nous vous encourageons à ajouter toute autre fonctionnalité supplémentaire que vous jugez pertinente.

Instructions

Vous devez utiliser une méthode d'authentification pour l'application.

Pour permettre aux utilisateurs d'utiliser l'application, vous devez créer un formulaire de connexion. L'utilisateur doit fournir :

    Email
    Mot de passe

Si l'utilisateur n'est pas enregistré, l'application doit le rediriger vers le site web du réseau social (projet obligatoire) afin qu'il puisse s'inscrire.

Lorsque l'utilisateur se connecte ou s'inscrit, il doit rester connecté jusqu'à ce qu'il choisisse une option de déconnexion qui doit être disponible à tout moment. Même lorsque l'utilisateur quitte l'application et la rouvre, il doit rester connecté jusqu'à ce que la session expire (la durée est à votre discrétion) ou que l'utilisateur décide de se déconnecter.

WebSocket

L'utilisation de WebSocket doit être présente dans ce projet :

    Vous devez pouvoir envoyer des messages en temps réel, comme dans le projet obligatoire. Vous devez pouvoir envoyer des messages de chat en utilisant le site web en tant qu'utilisateur, vers l'application de bureau en tant qu'un autre utilisateur.
    Pour voir le statut d'un utilisateur, chaque fois qu'un utilisateur se connecte ou se déconnecte, le statut doit changer automatiquement en temps réel. Ainsi, lorsqu'un utilisateur se déconnecte, tous ses abonnés doivent pouvoir voir que l'utilisateur s'est déconnecté et n'est pas disponible pour discuter. De même, lorsque l'utilisateur se connecte, tous ses abonnés doivent voir qu'il est en ligne.

Mode Hors Ligne

Si la connexion Internet est interrompue ou si l'utilisateur n'a pas Internet, l'application doit avertir l'utilisateur qu'il n'y a pas de connexion en affichant un message à cet effet. Le mode hors ligne permet à l'utilisateur de voir tous les messages envoyés, mais si l'utilisateur essaie d'envoyer un message, le même message d'erreur doit s'afficher.

Voici un conseil pour le mode hors ligne/en ligne :

Le code doit respecter les bonnes pratiques.

Recherche

La recherche doit être interactive, c'est-à-dire que les résultats doivent s'afficher au fur et à mesure que vous tapez, sans nécessiter de cliquer sur un bouton.

Ce projet vous aidera à en apprendre davantage sur :

    La manipulation de données et le stockage local
    L'authentification
    Les applications de bureau :
        Electron
    WebSocket
