sequenceDiagram
    participant Client1 as Client Auteur
    participant Client2 as Client Lecteur
    participant API as API REST
    participant PS as PostService
    participant PR as PostRepository
    participant PPR as PostPrivacyRepository
    participant CR as CommentRepository
    participant UR as UserRepository
    participant FR as FollowRepository
    participant NS as NotificationService
    participant WSM as WebSocketManager
    participant DB as Base de données SQLite

    %% Phase 1: Création d'une publication
    Client1->>API: POST /api/posts (content, image, privacy_type, allowed_users[])
    API->>PS: CreatePost(userId, content, privacyType, imagePath, allowedUsers)
    
    PS->>PS: Traiter l'image si nécessaire
    
    PS->>PR: Create(post)
    PR->>DB: INSERT INTO posts
    DB-->>PR: post_id
    PR-->>PS: Created Post
    
    alt privacyType == PRIVATE
        loop Pour chaque utilisateur autorisé
            PS->>PPR: Create(postId, allowedUserId)
            PPR->>DB: INSERT INTO post_privacy
        end
    end
    
    PS->>UR: GetFollowers(userId)
    UR->>FR: GetFollowers(userId)
    FR->>DB: SELECT FROM follows WHERE followed_id = ? AND is_accepted = true
    DB-->>FR: Followers
    FR-->>UR: Followers
    UR-->>PS: Followers
    
    loop Pour chaque follower
        PS->>NS: CreateNotification(followerId, POST_CREATED_TYPE, postId)
        NS->>DB: INSERT INTO notifications
        NS->>WSM: BroadcastToUser(followerId, notification)
    end
    
    WSM->>Client2: WS: {"type": "notification", "payload": {...}}
    
    PS-->>API: Publication créée
    API-->>Client1: 201 Created (post)

    %% Phase 2: Récupération des publications d'un utilisateur
    Client2->>API: GET /api/users/{user_id}/posts
    API->>PS: GetUserPosts(userId, viewerId)
    PS->>UR: GetByID(userId)
    UR->>DB: SELECT FROM users WHERE id = ?
    DB-->>UR: User
    UR-->>PS: User
    
    alt user.is_public == true
        PS->>PR: GetByUser(userId)
        PR->>DB: SELECT FROM posts WHERE user_id = ? ORDER BY created_at DESC
        DB-->>PR: Posts
        PR-->>PS: Posts
    else user.is_public == false
        PS->>FR: IsFollowing(viewerId, userId)
        FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ? AND is_accepted = true
        DB-->>FR: Result (true/false)
        FR-->>PS: isFollowing
        
        alt isFollowing == true
            PS->>PR: GetByUser(userId)
            PR->>DB: SELECT FROM posts WHERE user_id = ? ORDER BY created_at DESC
            DB-->>PR: Posts
            PR-->>PS: Posts
        else isFollowing == false && viewerId == userId
            PS->>PR: GetByUser(userId)
            PR->>DB: SELECT FROM posts WHERE user_id = ? ORDER BY created_at DESC
            DB-->>PR: Posts
            PR-->>PS: Posts
        else isFollowing == false
            PS-->>API: Permission denied
            API-->>Client2: 403 Forbidden
        end
    end
    
    loop Pour chaque post (si autorisé)
        alt post.privacy_type == PRIVATE
            PS->>PPR: IsAllowed(postId, viewerId)
            PPR->>DB: SELECT FROM post_privacy WHERE post_id = ? AND user_id = ?
            DB-->>PPR: Result
            PPR-->>PS: isAllowed
            
            alt isAllowed == false && viewerId != post.userId
                PS->>PS: Filtrer ce post
            end
        else post.privacy_type == ALMOST_PRIVATE
            PS->>FR: IsFollowing(viewerId, post.userId)
            FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ? AND is_accepted = true
            DB-->>FR: Result
            FR-->>PS: isFollowing
            
            alt isFollowing == false && viewerId != post.userId
                PS->>PS: Filtrer ce post
            end
        end
    end
    
    PS-->>API: Liste filtrée des posts
    API-->>Client2: 200 OK (posts)

    %% Phase 3: Ajout d'un commentaire
    Client2->>API: POST /api/posts/{post_id}/comments (content, image)
    API->>PS: CreateComment(userId, postId, content, imagePath)
    
    PS->>PR: GetByID(postId)
    PR->>DB: SELECT FROM posts WHERE id = ?
    DB-->>PR: Post
    PR-->>PS: Post
    
    alt post.privacy_type == PRIVATE
        PS->>PPR: IsAllowed(postId, userId)
        PPR->>DB: SELECT FROM post_privacy WHERE post_id = ? AND user_id = ?
        DB-->>PPR: Result
        PPR-->>PS: isAllowed
        
        alt isAllowed == false && userId != post.userId
            PS-->>API: Permission denied
            API-->>Client2: 403 Forbidden
        end
    else post.privacy_type == ALMOST_PRIVATE
        PS->>FR: IsFollowing(userId, post.userId)
        FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ? AND is_accepted = true
        DB-->>FR: Result
        FR-->>PS: isFollowing
        
        alt isFollowing == false && userId != post.userId
            PS-->>API: Permission denied
            API-->>Client2: 403 Forbidden
        end
    end
    
    PS->>PS: Traiter l'image si nécessaire
    
    PS->>CR: Create(comment)
    CR->>DB: INSERT INTO comments
    DB-->>CR: comment_id
    CR-->>PS: Created Comment
    
    PS->>NS: CreateNotification(post.userId, COMMENT_TYPE, commentId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(post.userId, notification)
    WSM->>Client1: WS: {"type": "notification", "payload": {...}}
    
    PS-->>API: Commentaire créé
    API-->>Client2: 201 Created (comment)

    %% Phase 4: Récupération des commentaires d'une publication
    Client1->>API: GET /api/posts/{post_id}/comments
    API->>PS: GetComments(postId, userId)
    
    PS->>PR: GetByID(postId)
    PR->>DB: SELECT FROM posts WHERE id = ?
    DB-->>PR: Post
    PR-->>PS: Post
    
    alt post.privacy_type == PRIVATE
        PS->>PPR: IsAllowed(postId, userId)
        PPR->>DB: SELECT FROM post_privacy WHERE post_id = ? AND user_id = ?
        DB-->>PPR: Result
        PPR-->>PS: isAllowed
        
        alt isAllowed == false && userId != post.userId
            PS-->>API: Permission denied
            API-->>Client1: 403 Forbidden
        end
    else post.privacy_type == ALMOST_PRIVATE
        PS->>FR: IsFollowing(userId, post.userId)
        FR->>DB: SELECT FROM follows WHERE follower_id = ? AND followed_id = ? AND is_accepted = true
        DB-->>FR: Result
        FR-->>PS: isFollowing
        
        alt isFollowing == false && userId != post.userId
            PS-->>API: Permission denied
            API-->>Client1: 403 Forbidden
        end
    end
    
    PS->>CR: GetByPost(postId)
    CR->>DB: SELECT FROM comments WHERE post_id = ? ORDER BY created_at ASC
    DB-->>CR: Comments
    CR-->>PS: Comments
    
    PS-->>API: Commentaires
    API-->>Client1: 200 OK (comments)