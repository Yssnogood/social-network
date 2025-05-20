# Wireframes du Réseau Social et de l'Application de Messagerie

## Structure générale

Le système comporte deux interfaces principales :
1. **Interface Web (Next.js)** - Réseau social complet avec messagerie
2. **Application Electron** - Axée sur la messagerie avec capacités hors ligne

## Interface Web - Pages et Navigation

### Pages d'authentification
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation non-connectée]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────┐  ┌──────────────┐  │
│  │                         │  │              │  │
│  │                         │  │    Image     │  │
│  │  • Inscription          │  │      du      │  │
│  │    - Email              │  │    Réseau    │  │
│  │    - Mot de passe       │  │    Social    │  │
│  │    - Prénom / Nom       │  │              │  │
│  │    - Date de naissance  │  │              │  │
│  │    - Avatar (opt.)      │  │              │  │
│  │    - Surnom (opt.)      │  │              │  │
│  │    - À propos (opt.)    │  │              │  │
│  │                         │  │              │  │
│  │  • Connexion            │  │              │  │
│  │    - Email              │  │              │  │
│  │    - Mot de passe       │  │              │  │
│  │                         │  │              │  │
│  └─────────────────────────┘  └──────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
   ↓                        ↓
   │                        │
   └─→ Page d'accueil     Page d'erreur
```

### Page d'accueil (Feed)
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation + Icônes + Profile] │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  NAVIGATION     │  FEED PRINCIPAL               │
│  ┌───────────┐  │  ┌─────────────────────────┐  │
│  │ Accueil   │  │  │ [Barre de création]     │  │
│  │ Profil    │  │  │ - Quoi de neuf ?        │  │
│  │ Messages  │  │  │ - Image/GIF             │  │
│  │ Groupes   │  │  │ - Confidentialité       │  │
│  │ Notif.    │  │  └─────────────────────────┘  │
│  └───────────┘  │                               │
│                 │  ┌─────────────────────────┐  │
│  SUGGESTIONS    │  │ [Publication 1]         │  │
│  ┌───────────┐  │  │ - Auteur + Avatar       │  │
│  │ Amis      │  │  │ - Date                  │  │
│  │ suggérés  │  │  │ - Contenu               │  │
│  │           │  │  │ - Image (opt.)          │  │
│  └───────────┘  │  │ - Actions (Commenter)   │  │
│                 │  │ - Commentaires          │  │
│                 │  └─────────────────────────┘  │
│                 │                               │
│                 │  ┌─────────────────────────┐  │
│                 │  │ [Publication 2]         │  │
│                 │  │ ...                     │  │
│                 │  └─────────────────────────┘  │
│                 │                               │
└─────────────────┴───────────────────────────────┘
   ↓         ↓         ↓        ↓          ↓
   │         │         │        │          │
   │         │         │        └→ Page Publication
   │         │         │
   │         │         └→ Page Groupe 
   │         │
   │         └→ Page Profil
   │
   └→ Page Messages
```

### Page Profil
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation + Icônes + Profile] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Banner]                                │    │
│  │ [Avatar] [Nom & Prénom]                 │    │
│  │                                         │    │
│  │ Surnom - À propos                       │    │
│  │                                         │    │
│  │ [Suivre/Ne plus suivre] [Message]       │    │
│  │                                         │    │
│  │ Visibilité: Public/Privé (propre profil)│    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Posts   │ │ Abonnements  │ │ Abonnés      │  │
│  └─────────┘ └──────────────┘ └──────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Liste des publications]                │    │
│  │                                         │    │
│  │ Similaire au feed, mais filtré pour     │    │
│  │ l'utilisateur                          │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
   ↓                    ↓                 ↓
   │                    │                 │
   │                    │                 └→ Liste d'abonnés
   │                    │
   │                    └→ Liste d'abonnements
   │
   └→ Publication spécifique
```

### Page Messages (Système de messagerie instantanée)
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation + Icônes + Profile] │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  CONVERSATIONS  │  CONVERSATION ACTIVE          │
│  ┌───────────┐  │  ┌─────────────────────────┐  │
│  │ [Nouvelle]│  │  │ [En-tête]               │  │
│  └───────────┘  │  │ - Avatar/nom destinataire │
│                 │  │ - Statut en ligne        │  │
│  ┌───────────┐  │  │ - Actions (appel, info)  │  │
│  │ [Recherche]│  │  └─────────────────────────┘  │
│  └───────────┘  │                               │
│                 │  ┌─────────────────────────┐  │
│  ┌───────────┐  │  │ [Zone de messages]      │  │
│  │ Chat 1    │  │  │ - Messages reçus        │  │
│  │ - Avatar  │  │  │   (gauche)              │  │
│  │ - Nom     │  │  │ - Messages envoyés      │  │
│  │ - Aperçu  │  │  │   (droite)              │  │
│  │ - Temps   │  │  │ - Références (en-tête)  │  │
│  └───────────┘  │  │ - Indicateurs de lecture│  │
│                 │  │ - Horodatage            │  │
│  ┌───────────┐  │  │                         │  │
│  │ Chat 2    │  │  │                         │  │
│  │ ...       │  │  │                         │  │
│  └───────────┘  │  └─────────────────────────┘  │
│                 │                               │
│  ┌───────────┐  │  ┌─────────────────────────┐  │
│  │ Chat 3    │  │  │ [Typing indicator]      │  │
│  │ ...       │  │  │ "User est en train      │  │
│  └───────────┘  │  │  d'écrire..."           │  │
│                 │  └─────────────────────────┘  │
│                 │                               │
│                 │  ┌─────────────────────────┐  │
│                 │  │ [Zone de saisie]        │  │
│                 │  │ - Champ texte           │  │
│                 │  │ - Bouton emoji          │  │
│                 │  │ - Joindre média         │  │
│                 │  │ - Envoyer               │  │
│                 │  └─────────────────────────┘  │
└─────────────────┴───────────────────────────────┘
   ↓                             ↓
   │                             │
   └→ Nouvelle conversation    Messages précédents
```

### Page Groupe
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation + Icônes + Profile] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Banner]                                │    │
│  │ [Image] [Nom du groupe]                 │    │
│  │                                         │    │
│  │ Description                             │    │
│  │                                         │    │
│  │ [Rejoindre/Quitter] [Inviter]           │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Posts   │ │ Événements   │ │ Membres      │  │
│  └─────────┘ └──────────────┘ └──────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Créer une publication]                 │    │
│  │ - Similaire au feed principal           │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Liste des publications du groupe]      │    │
│  │                                         │    │
│  │ Similaire au feed, mais filtré pour     │    │
│  │ le groupe                               │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
   ↓                  ↓                  ↓
   │                  │                  │
   │                  │                  └→ Liste des membres
   │                  │
   │                  └→ Liste des événements
   │
   └→ Chat du groupe
```

### Page Événement
```
┌─────────────────────────────────────────────────┐
│ [Header - Logo + Navigation + Icônes + Profile] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Titre de l'événement]                  │    │
│  │                                         │    │
│  │ Créé par: [Nom du créateur]             │    │
│  │ Date/Heure: [Date et heure]             │    │
│  │                                         │    │
│  │ Description                             │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Options de réponse]                    │    │
│  │ ○ Participe                             │    │
│  │ ○ Ne participe pas                      │    │
│  │ ○ [Autres options]                      │    │
│  │                                         │    │
│  │ [Valider]                               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Réponses]                              │    │
│  │                                         │    │
│  │ Participant (X):                        │    │
│  │ - Liste des utilisateurs                │    │
│  │                                         │    │
│  │ Ne participe pas (Y):                   │    │
│  │ - Liste des utilisateurs                │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Panneau de Notifications
```
┌─────────────────────────────────┐
│ NOTIFICATIONS                   │
├─────────────────────────────────┤
│                                 │
│ ● [Demande de suivi]            │
│   - Avatar                      │
│   - Nom veut vous suivre        │
│   - [Accepter] [Refuser]        │
│                                 │
│ ○ [Invitation groupe]           │
│   - Avatar                      │
│   - Invitation au groupe X      │
│   - [Accepter] [Refuser]        │
│                                 │
│ ○ [Nouvelle publication]        │
│   - Avatar                      │
│   - Nom a publié un post        │
│   - Aperçu du contenu           │
│                                 │
│ ○ [Nouvel événement]            │
│   - Icône événement             │
│   - Nouvel événement dans X     │
│   - Date/Heure                  │
│                                 │
│ ○ [Message]                     │
│   - Avatar                      │
│   - Nouveau message de Nom      │
│   - Aperçu du message           │
│                                 │
└─────────────────────────────────┘
```

## Application Electron - Pages et Navigation

### Écran de Connexion
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│               [Logo du Réseau Social]           │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Email:                                  │    │
│  │ [                                     ] │    │
│  │                                         │    │
│  │ Mot de passe:                           │    │
│  │ [                                     ] │    │
│  │                                         │    │
│  │ [Se connecter]                          │    │
│  │                                         │    │
│  │ Pas encore inscrit ?                    │    │
│  │ [S'inscrire sur le site web]            │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Interface Principale de Messagerie
```
┌─────────────────────────────────────────────────┐
│ [Barre de titre - Logo + Statut Connexion]      │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  [Avatar/Profil]│  CONVERSATION ACTIVE          │
│  [Statut en     │  ┌─────────────────────────┐  │
│   ligne]        │  │ [En-tête]               │  │
│                 │  │ - Avatar/nom destinataire │
│  CONVERSATIONS  │  │ - Statut en ligne        │  │
│  ┌───────────┐  │  │ - Recherche dans convers.│  │
│  │ [Recherche]│  │  └─────────────────────────┘  │
│  └───────────┘  │                               │
│                 │  ┌─────────────────────────┐  │
│  ┌───────────┐  │  │ [Zone de messages]      │  │
│  │ Chat 1    │  │  │ - Messages reçus        │  │
│  │ - Avatar  │  │  │   (gauche)              │  │
│  │ - Nom     │  │  │ - Messages envoyés      │  │
│  │ - Aperçu  │  │  │   (droite)              │  │
│  │ - Temps   │  │  │ - Références (en-tête)  │  │
│  └───────────┘  │  │ - Indicateurs de lecture│  │
│                 │  │ - Horodatage            │  │
│  ┌───────────┐  │  │                         │  │
│  │ Chat 2    │  │  │                         │  │
│  │ ...       │  │  │                         │  │
│  └───────────┘  │  └─────────────────────────┘  │
│                 │                               │
│  ┌───────────┐  │  ┌─────────────────────────┐  │
│  │ Chat 3    │  │  │ [Typing indicator]      │  │
│  │ ...       │  │  │ "User est en train      │  │
│  └───────────┘  │  │  d'écrire..."           │  │
│                 │  └─────────────────────────┘  │
│                 │                               │
│  [Mode hors     │  ┌─────────────────────────┐  │
│   ligne]        │  │ [Zone de saisie]        │  │
│  [Paramètres]   │  │ - Champ texte           │  │
│                 │  │ - Bouton emoji          │  │
│                 │  │ - Joindre média         │  │
│                 │  │ - Envoyer               │  │
│                 │  └─────────────────────────┘  │
└─────────────────┴───────────────────────────────┘
```

### Recherche de Messages
```
┌─────────────────────────────────────────────────┐
│ [Barre de titre - Logo + Statut Connexion]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Recherche: [                          ] │    │
│  │                                         │    │
│  │ Filtres:                                │    │
│  │ [ ] Messages [ ] Images                 │    │
│  │ [ ] Conversations                       │    │
│  │                                         │    │
│  │ Période: [Tous ▼]                       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Résultats (X)                           │    │
│  │                                         │    │
│  │ [Résultat 1]                            │    │
│  │ - Conversation: Nom                     │    │
│  │ - Date/heure                            │    │
│  │ - Extrait avec terme surligné           │    │
│  │                                         │    │
│  │ [Résultat 2]                            │    │
│  │ ...                                     │    │
│  │                                         │    │
│  │ [Résultat 3]                            │    │
│  │ ...                                     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mode Hors Ligne
```
┌─────────────────────────────────────────────────┐
│ [Barre de titre - Logo + Statut: HORS LIGNE]    │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  [Avatar/Profil]│  ┌─────────────────────────┐  │
│  [Hors ligne]   │  │                         │  │
│                 │  │  MODE HORS LIGNE ACTIF  │  │
│  CONVERSATIONS  │  │                         │  │
│  DISPONIBLES    │  │  Vous êtes actuellement │  │
│  HORS LIGNE     │  │  hors ligne. Les        │  │
│                 │  │  messages envoyés       │  │
│  ┌───────────┐  │  │  seront mis en file     │  │
│  │ Chat 1    │  │  │  d'attente et envoyés   │  │
│  │ - Avatar  │  │  │  lors de la reconnexion │  │
│  │ - Nom     │  │  │                         │  │
│  └───────────┘  │  │  [Tenter de reconnecter]│  │
│                 │  │                         │  │
│  ┌───────────┐  │  └─────────────────────────┘  │
│  │ Chat 2    │  │                               │
│  │ ...       │  │  ┌─────────────────────────┐  │
│  └───────────┘  │  │                         │  │
│                 │  │  Messages en attente: X  │  │
│                 │  │                         │  │
│  [Recherche     │  │  [Gérer les messages    │  │
│   hors ligne]   │  │   en file d'attente]    │  │
│                 │  │                         │  │
│                 │  └─────────────────────────┘  │
└─────────────────┴───────────────────────────────┘
```

## Relations entre les pages

### Web - Navigation principale
```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Accueil │────>│ Profil  │────>│ Messages│────>│ Groupes │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
    │               │               │               │
    v               v               v               v
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Publications│   │Abonnements│   │Conversation│  │Événements│
└─────────┘     └─────────┘     └─────────┘     └─────────┘
    │               │               │               │
    v               v               v               v
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Commentaires│   │Profils   │   │Messages  │   │Réponses  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Electron - Navigation principale
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Connexion│────>│Liste des│────>│Conversation│
└─────────┘     │ Convers.│     │  Active  │
                └─────────┘     └─────────┘
                    │               │
                    v               v
                ┌─────────┐     ┌─────────┐
                │Recherche │    │ Répondre │
                │de Messages│    │à Message │
                └─────────┘     └─────────┘
                    │               │
                    v               │
                ┌─────────┐        │
                │Mode Hors │<──────┘
                │ Ligne    │
                └─────────┘
```

## Interactions et fonctionnalités communes

1. **Partout** : Notifications, navigation principale, accès au profil
2. **Page d'accueil** : Création de publications, affichage du feed
3. **Profil** : Modification des infos (si propriétaire), suivi/désabonnement
4. **Publications** : Création, commentaires, confidentialité
5. **Messages** : Conversations, indicateurs de frappe, accusés de lecture
6. **Groupes** : Événements, invitations, publications de groupe
7. **Application Electron** : Synchronisation, mode hors ligne, recherche

## Points de transition Web ↔ Electron

1. **Authentification** : Connexion simultanée possible sur web et Electron
2. **Messagerie** : Synchronisation des messages entre web et Electron
3. **Notifications** : Disponibles sur les deux plateformes
4. **Mode hors ligne** : Spécifique à Electron, avec synchronisation à la reconnexion