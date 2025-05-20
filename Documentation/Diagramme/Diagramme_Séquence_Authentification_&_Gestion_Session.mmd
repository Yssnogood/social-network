sequenceDiagram
    participant Client as Client Web/Electron
    participant API as API REST
    participant AS as AuthService
    participant US as UserService
    participant UR as UserRepository
    participant SR as SessionRepository
    participant WSM as WebSocketManager
    participant DB as Base de données SQLite

    %% Phase 1: Inscription
    Client->>API: POST /api/auth/register (email, password, first_name, last_name, etc.)
    API->>AS: Register(email, password, first_name, last_name, etc.)
    AS->>UR: GetByEmail(email)
    UR->>DB: SELECT FROM users WHERE email = ?
    DB-->>UR: null (email n'existe pas)
    AS->>AS: HashPassword(password)
    AS->>UR: Create(user)
    UR->>DB: INSERT INTO users
    DB-->>UR: user_id
    UR-->>AS: Created User
    AS-->>API: User créé avec succès
    API-->>Client: 201 Created (user_id)

    %% Phase 2: Connexion
    Client->>API: POST /api/auth/login (email, password, client_id, device_info)
    API->>AS: Login(email, password, client_id, device_info)
    AS->>UR: GetByEmail(email)
    UR->>DB: SELECT FROM users WHERE email = ?
    DB-->>UR: User
    UR-->>AS: User
    AS->>AS: VerifyPassword(password, user.password_hash)
    AS->>SR: Create(session)
    SR->>DB: INSERT INTO sessions
    DB-->>SR: session_id
    SR-->>AS: Created Session
    AS->>US: UpdateOnlineStatus(userId, true)
    US->>UR: UpdateOnlineStatus(userId, true)
    UR->>DB: UPDATE users SET online_status = true WHERE id = ?
    AS->>WSM: BroadcastStatusUpdate(userId, online: true)
    AS-->>API: {token, user}
    API-->>Client: 200 OK {token, user, expires_at}

    %% Phase 3: Validation de session lors des requêtes
    Client->>API: GET /api/protected-resource (Authorization: Bearer token)
    API->>AS: ValidateSession(token)
    AS->>SR: GetByToken(token)
    SR->>DB: SELECT FROM sessions WHERE token = ? AND expires_at > NOW()
    DB-->>SR: Session
    SR-->>AS: Session valide
    AS-->>API: User authentifié (user_id)
    API->>API: Continue le traitement de la requête
    API-->>Client: 200 OK (ressource demandée)
    
    %% Phase 4: Déconnexion
    Client->>API: POST /api/auth/logout (token)
    API->>AS: Logout(token)
    AS->>SR: Delete(token)
    SR->>DB: DELETE FROM sessions WHERE token = ?
    AS->>US: UpdateOnlineStatus(userId, false)
    US->>UR: UpdateOnlineStatus(userId, false)
    UR->>DB: UPDATE users SET online_status = false WHERE id = ?
    US->>WSM: BroadcastStatusUpdate(userId, online: false)
    AS-->>API: Déconnexion réussie
    API-->>Client: 200 OK

    %% Phase 5: Expiration/Rafraîchissement de session
    Note over Client,DB: Après un certain temps
    Client->>API: POST /api/auth/refresh (token)
    API->>AS: RefreshSession(token)
    AS->>SR: GetByToken(token)
    SR->>DB: SELECT FROM sessions WHERE token = ?
    DB-->>SR: Session
    SR-->>AS: Session
    AS->>AS: GenerateNewToken()
    AS->>SR: Update(sessionId, newToken, newExpiresAt)
    SR->>DB: UPDATE sessions SET token = ?, expires_at = ? WHERE id = ?
    AS-->>API: Nouvelle session
    API-->>Client: 200 OK {token, expires_at}