# Modèle Logique des Données (MLD) Révisé

## Utilisateurs
- **users** (id, email, password_hash, first_name, last_name, birth_date, avatar_path, username, about_me, is_public, created_at, updated_at, online_status)

## Système de publications classique
- **posts** (id, user_id, content, image_path, privacy_type, created_at, updated_at)
- **comments** (id, post_id, user_id, content, image_path, created_at)
- **post_privacy** (id, post_id, user_id)
- **groups** (id, creator_id, title, description, created_at)
- **group_members** (id, group_id, user_id, is_accepted, created_at)
- **group_posts** (id, group_id, user_id, content, image_path, created_at)
- **group_comments** (id, group_post_id, user_id, content, image_path, created_at)

## Événements
- **events** (id, group_id, creator_id, title, description, event_time, created_at)
- **event_options** (id, event_id, option_text)
- **event_responses** (id, event_id, user_id, option_id, created_at)

## Système de messagerie instantanée
- **conversations** (id, name, is_group, created_at)
- **conversation_participants** (id, conversation_id, user_id, joined_at)
- **instant_messages** (id, conversation_id, sender_id, reference_message_id, content, image_path, is_read, created_at)
- **typing_status** (id, conversation_id, user_id, last_updated)
- **read_receipts** (id, message_id, user_id, read_at)

## Système commun
- **follows** (id, follower_id, followed_id, is_accepted, created_at)
- **notifications** (id, user_id, type, reference_id, reference_type, is_read, created_at)
- **sessions** (id, user_id, token, expires_at, client_id, device_info)

## Relations
- users.id → posts.user_id
- users.id → comments.user_id
- posts.id → comments.post_id
- posts.id → post_privacy.post_id
- users.id → post_privacy.user_id
- users.id → follows.follower_id
- users.id → follows.followed_id
- users.id → groups.creator_id
- groups.id → group_members.group_id
- users.id → group_members.user_id
- groups.id → group_posts.group_id
- users.id → group_posts.user_id
- group_posts.id → group_comments.group_post_id
- users.id → group_comments.user_id
- groups.id → events.group_id
- users.id → events.creator_id
- events.id → event_options.event_id
- events.id → event_responses.event_id
- users.id → event_responses.user_id
- event_options.id → event_responses.option_id

- users.id → conversation_participants.user_id
- conversations.id → conversation_participants.conversation_id
- users.id → instant_messages.sender_id
- conversations.id → instant_messages.conversation_id
- instant_messages.id → instant_messages.reference_message_id
- users.id → typing_status.user_id
- conversations.id → typing_status.conversation_id
- instant_messages.id → read_receipts.message_id
- users.id → read_receipts.user_id

- users.id → notifications.user_id
- users.id → sessions.user_id