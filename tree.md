 social-network % tree -I node_modules -I frontend/.next -I frontend/node_modules -I .vscode
.
├── backend
│   ├── app
│   │   ├── domain
│   │   ├── services
│   │   │   ├── PostService.go
│   │   │   └── UserService.go
│   │   ├── utils
│   │   └── validation
│   ├── cmd
│   │   ├── server
│   │   │   └── main.go
│   │   └── tools
│   │       └── migrate.go
│   ├── database
│   │   ├── migrations
│   │   │   └── sqlite
│   │   │       ├── 001_create_users_table.down.sql
│   │   │       ├── 001_create_users_table.up.sql
│   │   │       ├── 002_create_posts_table.down.sql
│   │   │       ├── 002_create_posts_table.up.sql
│   │   │       ├── 003_create_followers_table.down.sql
│   │   │       ├── 003_create_followers_table.up.sql
│   │   │       ├── 004_create_messages_table.down.sql
│   │   │       ├── 004_create_messages_table.up.sql
│   │   │       ├── 005_create_notifications_table.down.sql
│   │   │       ├── 005_create_notifications_table.up.sql
│   │   │       ├── 006_create_sessions_table.down.sql
│   │   │       ├── 006_create_sessions_table.up.sql
│   │   │       ├── 007_create_comments_table.down.sql
│   │   │       ├── 007_create_comments_table.up.sql
│   │   │       ├── 008_create_post_privacy_table.down.sql
│   │   │       ├── 008_create_post_privacy_table.up.sql
│   │   │       ├── 009_create_groups_table.down.sql
│   │   │       ├── 009_create_groups_table.up.sql
│   │   │       ├── 010_create_group_members_table.down.sql
│   │   │       ├── 010_create_group_members_table.up.sql
│   │   │       ├── 011_create_group_invitations_table.down.sql
│   │   │       ├── 011_create_group_invitations_table.up.sql
│   │   │       ├── 012_create_group_posts_table.down.sql
│   │   │       ├── 012_create_group_posts_table.up.sql
│   │   │       ├── 013_create_group_comments_table.down.sql
│   │   │       ├── 013_create_group_comments_table.up.sql
│   │   │       ├── 014_create_events_table.down.sql
│   │   │       ├── 014_create_events_table.up.sql
│   │   │       ├── 015_create_event_options_table.down.sql
│   │   │       ├── 015_create_event_options_table.up.sql
│   │   │       ├── 016_create_event_responses_table.down.sql
│   │   │       ├── 016_create_event_responses_table.up.sql
│   │   │       ├── 017_create_conversations_table.down.sql
│   │   │       ├── 017_create_conversations_table.up.sql
│   │   │       ├── 018_create_conversation_members_table.down.sql
│   │   │       ├── 018_create_conversation_members_table.up.sql
│   │   │       ├── 019_create_typing_status_table.down.sql
│   │   │       ├── 019_create_typing_status_table.up.sql
│   │   │       ├── 020_create_post_like_table.down.sql
│   │   │       └── 020_create_post_like_table.up.sql
│   │   ├── models
│   │   │   └── models.go
│   │   ├── repositories
│   │   │   ├── comment_interface.go
│   │   │   ├── comment.go
│   │   │   ├── conversation_inteface.go
│   │   │   ├── conversation_members_interface.go
│   │   │   ├── conversation_members.go
│   │   │   ├── conversation.go
│   │   │   ├── event_interface.go
│   │   │   ├── event.go
│   │   │   ├── follower_interface.go
│   │   │   ├── follower.go
│   │   │   ├── group_interface.go
│   │   │   ├── group.go
│   │   │   ├── message_interface.go
│   │   │   ├── message.go
│   │   │   ├── notification_interface.go
│   │   │   ├── notification.go
│   │   │   ├── post_interface.go
│   │   │   ├── post.go
│   │   │   ├── session_interface.go
│   │   │   ├── session.go
│   │   │   ├── typing_status_interface.go
│   │   │   ├── typing_status.go
│   │   │   ├── user_interface.go
│   │   │   └── user.go
│   │   └── sqlite
│   │       ├── data.db
│   │       └── sqlite.go
│   ├── repositories
│   ├── server
│   │   ├── config
│   │   ├── handlers
│   │   │   ├── CommentHandler.go
│   │   │   ├── EventHandler.go
│   │   │   ├── FollowerHandler.go
│   │   │   ├── GroupHandler.go
│   │   │   ├── MessageHandler.go
│   │   │   ├── NotificationHandler.go
│   │   │   ├── PostHandler.go
│   │   │   ├── SessionHandler.go
│   │   │   └── UserHandler.go
│   │   ├── middlewares
│   │   │   └── jwt.go
│   │   └── routes
│   │       ├── comment_route.go
│   │       ├── event_route.go
│   │       ├── follower_route.go
│   │       ├── group_route.go
│   │       ├── message_route.go
│   │       ├── notification_route.go
│   │       ├── post_route.go
│   │       ├── session_route.go
│   │       └── user_route.go
│   └── tests
│       ├── handlers
│       ├── repositories
│       └── services
├── build-local.sh
├── dev.sh
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── Documentation
│   ├── base_Projet
│   │   ├── Architecture Multicouche_&_Application_Principes_SOLID.md
│   │   ├── Conclusion-Architecture.md
│   │   ├── Dictionnaire_de_Données_table_Conversations_Messages.md
│   │   ├── Dictionnaire_de_Données.md
│   │   ├── Modèle_Logique_Données_(MLD).md
│   │   ├── Modèle_Physique_Données(MPD).sql
│   │   ├── schemaDB_2.mmd
│   │   └── schemaDB_2.png
│   ├── Diagramme
│   │   ├── Diagramme_architecture_technique.md
│   │   ├── Diagramme_architecture_technique.mmd
│   │   ├── Diagramme_architecture_technique.png
│   │   ├── Diagramme_cas_utilisation.md
│   │   ├── Diagramme_cas_utilisation.mmd
│   │   ├── Diagramme_cas_utilisation.png
│   │   ├── Diagramme_de_Classes_UML.md
│   │   ├── Diagramme_de_Classes_UML.mmd
│   │   ├── Diagramme_de_Classes_UML.png
│   │   ├── Diagramme_de_Séquence_pour_envoi_message_avec_référence.md
│   │   ├── Diagramme_de_Séquence_pour_envoi_message_avec_référence.mmd
│   │   ├── Diagramme_de_Séquence_pour_envoi_message_avec_référence.png
│   │   ├── Diagramme_Séquence_Authentification_&_Gestion_Session.md
│   │   ├── Diagramme_Séquence_Authentification_&_Gestion_Session.mmd
│   │   ├── Diagramme_Séquence_Authentification_&_Gestion_Session.png
│   │   ├── Diagramme_Séquence_Gestion_Posts_Commentaires.md
│   │   ├── Diagramme_Séquence_Gestion_Posts_Commentaires.mmd
│   │   ├── Diagramme_Séquence_Gestion_Posts_Commentaires.png
│   │   ├── Diagramme_Séquence_Gestion_Utilisateurs_&_Abonnements.md
│   │   ├── Diagramme_Séquence_Gestion_Utilisateurs_&_Abonnements.mmd
│   │   ├── Diagramme_Séquence_Gestion_Utilisateurs_&_Abonnements.png
│   │   ├── Diagramme_Séquence_Groupes_Événements.md
│   │   ├── Diagramme_Séquence_Groupes_Événements.mmd
│   │   ├── Diagramme_Séquence_Groupes_Événements.png
│   │   ├── Diagramme_Séquence_Messagerie_Instantanée_Typing_Status.md
│   │   ├── Diagramme_Séquence_Messagerie_Instantanée_Typing_Status.mmd
│   │   ├── Diagramme_Séquence_Messagerie_Instantanée_Typing_Status.png
│   │   ├── Diagramme_Séquence_Mode Hors_Ligne_Synchronisation(Electron).md
│   │   ├── Diagramme_Séquence_Mode Hors_Ligne_Synchronisation(Electron).mmd
│   │   └── Diagramme_Séquence_Mode Hors_Ligne_Synchronisation(Electron).png
│   ├── preparation_projet
│   │   ├── Architecture_modulaire_SN.md
│   │   ├── Architecture_WebSocket_intégration_multiplateforme.md
│   │   ├── Audit_optionnel.md
│   │   ├── Audit.md
│   │   ├── consigne_optionnel.md
│   │   ├── consigne.md
│   │   ├── guide_Certif.md
│   │   └── structure_dossier_proposition.md
│   ├── systeme websocket
│   │   └── guide_websocket.md
│   └── wirframe_social_network.md
├── frontend
│   ├── app
│   │   ├── components
│   │   │   ├── navbar.tsx
│   │   │   └── post_form.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── home
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── logout
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── post
│   │   │   └── [id]
│   │   │       └── comments
│   │   │           └── page.tsx
│   │   ├── profile
│   │   │   └── [username]
│   │   │       └── page.tsx
│   │   └── register
│   │       └── page.tsx
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── defaultPP.webp
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── social-placeholder.png
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── README.md
│   ├── services
│   │   ├── comment.ts
│   │   ├── post.ts
│   │   ├── user.ts
│   │   └── utils.ts
│   └── tsconfig.json
├── go.mod
├── go.sum
├── readme.DOCKER.md
├── start-sans-docker.sh
├── tampon.go
├── tree.md
└── uploads

47 directories, 181 files