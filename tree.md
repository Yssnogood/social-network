social-network % tree -I 'node_modules|.next|.vscode|.git|*.log|Documentation|ATransmettre'
.
├── backend
│   ├── app
│   │   ├── domain
│   │   ├── services
│   │   │   ├── CommentService.go
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
│   │   │       ├── 012_create_group_messages_table.down.sql
│   │   │       ├── 012_create_group_messages_table.up.sql
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
│   │       ├── add_follow.sql
│   │       ├── data.db
│   │       └── sqlite.go
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
│   │   │   ├── cors.go
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
│   ├── tests
│   │   ├── handlers
│   │   ├── repositories
│   │   └── services
│   └── websocket
│       ├── client.go
│       ├── handler.go
│       ├── hub.go
│       ├── router.go
│       └── websocket_type.go
├── build-local.sh
├── copy-ATransmettre.sh
├── dev.sh
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── frontend
│   ├── app
│   │   ├── components
│   │   │   ├── ChatModal.tsx
│   │   │   ├── FollowersSection.tsx
│   │   │   ├── GroupModal.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── NotificationPanel.tsx
│   │   │   └── post_form.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── groups
│   │   │   └── [id]
│   │   │       └── page.tsx
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
│   │   │       ├── EditableProfile.tsx
│   │   │       ├── page.tsx
│   │   │       ├── Profile.tsx
│   │   │       └── ProfileTabs.tsx
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
│   │   ├── contact.ts
│   │   ├── notifications.ts
│   │   ├── post.ts
│   │   ├── user.ts
│   │   └── utils.ts
│   └── tsconfig.json
├── go.mod
├── go.sum
├── package-lock.json
├── readme.DOCKER.md
├── start-sans-docker.sh
├── tampon.go
├── tampon.md
├── tampon.tsx
├── tree.md
└── tree2.md

43 directories, 156 files