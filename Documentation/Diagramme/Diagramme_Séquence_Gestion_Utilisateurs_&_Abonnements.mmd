sequenceDiagram
    participant Client1 as Client (Utilisateur 1)
    participant Client2 as Client (Utilisateur 2)
    participant API as API REST
    participant US as UserService
    participant UR as UserRepository
    participant FR as FollowRepository
    participant NS as NotificationService
    participant NR as NotificationRepository
    participant WSM as WebSocketManager
    participant DB as Base de données SQLite

    %% Phase 1: Consulter un profil
    Client1->>API: GET /api/users/{user_id}
    API->>US: GetProfile(userId, viewerId)
    US->>UR: GetByID(userId)
    UR->>DB: SELECT FROM users WHERE id = ?
    DB-->>UR: User
    UR-->>US: User
    US->>FR: IsFollowing(viewerId, userId)
    FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ? AND is_accepted = true
    DB-->>FR: Result (true/false)
    FR-->>US: isFollowing
    
    alt Profil public OU viewer suit la cible
        US-->>API: Profil complet
        API-->>Client1: 200 OK (profil complet)
    else Profil privé ET viewer ne suit pas la cible
        US-->>API: Profil limité
        API-->>Client1: 200 OK (profil limité)
    end

    %% Phase 2: Demande de suivi (pour un profil privé)
    Client1->>API: POST /api/users/{user_id}/follow
    API->>US: FollowUser(followerId, followedId)
    US->>UR: GetByID(followedId)
    UR->>DB: SELECT FROM users WHERE id = ?
    DB-->>UR: User
    UR-->>US: User (avec is_public)
    US->>FR: IsFollowing(followerId, followedId)
    FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ?
    DB-->>FR: null (n'existe pas)
    
    alt Profil public
        US->>FR: Create(follower_id, followed_id, is_accepted: true)
        FR->>DB: INSERT INTO follows (follower_id, followed_id, is_accepted) VALUES (?, ?, true)
        US->>NS: CreateNotification(followedId, FOLLOW_TYPE, followerId)
        NS->>NR: Create(notification)
        NR->>DB: INSERT INTO notifications
        NS->>WSM: BroadcastToUser(followedId, notification)
        WSM->>Client2: WS: {"type": "notification", "payload": {...}}
        US-->>API: Suivi accepté automatiquement
        API-->>Client1: 200 OK (suivi accepté)
    else Profil privé
        US->>FR: Create(follower_id, followed_id, is_accepted: false)
        FR->>DB: INSERT INTO follows (follower_id, followed_id, is_accepted) VALUES (?, ?, false)
        US->>NS: CreateNotification(followedId, FOLLOW_REQUEST_TYPE, followerId)
        NS->>NR: Create(notification)
        NR->>DB: INSERT INTO notifications
        NS->>WSM: BroadcastToUser(followedId, notification)
        WSM->>Client2: WS: {"type": "notification", "payload": {...}}
        US-->>API: Demande envoyée
        API-->>Client1: 202 Accepted (demande en attente)
    end

    %% Phase 3: Acceptation d'une demande de suivi
    Client2->>API: POST /api/follow-requests/{follow_id}/accept
    API->>US: AcceptFollowRequest(followId)
    US->>FR: GetByID(followId)
    FR->>DB: SELECT FROM follows WHERE id = ?
    DB-->>FR: Follow
    FR-->>US: Follow
    US->>FR: Update(followId, is_accepted: true)
    FR->>DB: UPDATE follows SET is_accepted = true WHERE id = ?
    US->>NS: CreateNotification(followerId, FOLLOW_ACCEPTED_TYPE, followedId)
    NS->>NR: Create(notification)
    NR->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(followerId, notification)
    WSM->>Client1: WS: {"type": "notification", "payload": {...}}
    US-->>API: Demande acceptée
    API-->>Client2: 200 OK

    %% Phase 4: Arrêter de suivre un utilisateur
    Client1->>API: DELETE /api/users/{user_id}/follow
    API->>US: UnfollowUser(followerId, followedId)
    US->>FR: Delete(followerId, followedId)
    FR->>DB: DELETE FROM follows WHERE follower_id = ? AND followed_id = ?
    US-->>API: Suivi supprimé
    API-->>Client1: 200 OK

    %% Phase 5: Basculer visibilité du profil
    Client1->>API: PUT /api/users/profile/privacy (is_public)
    API->>US: SetProfilePrivacy(userId, isPublic)
    US->>UR: Update(userId, is_public: isPublic)
    UR->>DB: UPDATE users SET is_public = ? WHERE id = ?
    US-->>API: Visibilité mise à jour
    API-->>Client1: 200 OK