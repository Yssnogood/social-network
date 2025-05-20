sequenceDiagram
    participant Client as Application Electron
    participant LDB as Base de données locale
    participant API as API REST
    participant WSM as WebSocketManager
    participant OS as OfflineSyncService
    participant MS as InstantMessageService
    participant MR as InstantMessageRepository
    participant CS as ConversationService
    participant CR as ConversationRepository
    participant DB as Base de données SQLite

    %% Phase 1: Chargement initial et mise en cache
    Client->>Client: Initialisation
    Client->>LDB: Récupérer lastSyncTime
    LDB-->>Client: lastSyncTime
    Client->>API: GET /api/users/me/conversations
    API->>CS: GetConversations(userId)
    CS->>CR: GetByParticipant(userId)
    CR->>DB: SELECT FROM conversations JOIN conversation_participants...
    DB-->>CR: Conversations
    CR-->>CS: Conversations
    CS-->>API: Conversations
    API-->>Client: 200 OK (conversations)
    Client->>LDB: Stocker les conversations
    
    loop Pour chaque conversation
        Client->>API: GET /api/conversations/{id}/messages
        API->>MS: GetMessages(conversationId, pagination)
        MS->>MR: GetByConversation(conversationId, pagination)
        MR->>DB: SELECT FROM instant_messages WHERE conversation_id = ?
        DB-->>MR: Messages
        MR-->>MS: Messages
        MS-->>API: Messages
        API-->>Client: 200 OK (messages)
        Client->>LDB: Stocker les messages
    end
    
    Client->>WSM: WS: Connect (token, client_id)
    WSM->>WSM: Register client

    %% Phase 2: Perte de connexion
    Client->>Client: Event 'offline'
    Client->>Client: SetOfflineMode(true)
    Client->>Client: Afficher "Mode hors ligne"
    Client->>Client: Désactiver la synchronisation en temps réel
    
    %% Phase 3: Utilisation hors ligne
    Client->>LDB: Récupérer conversations/messages
    LDB-->>Client: Données locales
    Client->>Client: Afficher les données en mode lecture seule
    
    %% Tentative d'envoi de message en mode hors ligne
    Client->>Client: Utilisateur tente d'envoyer un message
    Client->>Client: Afficher alerte "Impossible d'envoyer en mode hors ligne"
    Client->>LDB: Stocker le message dans la file d'attente
    
    %% Phase 4: Recherche hors ligne
    Client->>Client: Utilisateur recherche "mot clé"
    Client->>Client: Initialiser le moteur de recherche
    Client->>LDB: Rechercher "mot clé" dans les messages
    LDB-->>Client: Résultats de recherche
    Client->>Client: Afficher les résultats

    %% Phase 5: Reconnexion et synchronisation
    Client->>Client: Event 'online'
    Client->>Client: SetOfflineMode(false)
    Client->>Client: Afficher "Reconnexion en cours..."
    
    %% Récupération des messages manqués
    Client->>API: GET /api/sync/messages?last_sync={lastSyncTime}
    API->>OS: SyncMessages(userId, lastSyncTime)
    OS->>MR: GetMessagesSince(userId, lastSyncTime)
    MR->>DB: SELECT FROM instant_messages WHERE created_at > ? AND conversation_id IN (user's conversations)
    DB-->>MR: Nouveaux messages
    MR-->>OS: Nouveaux messages
    OS-->>API: Nouveaux messages
    API-->>Client: 200 OK (nouveaux messages)
    Client->>LDB: Stocker les nouveaux messages
    
    %% Envoi des messages en file d'attente
    Client->>LDB: Récupérer les messages en file d'attente
    LDB-->>Client: Messages à envoyer
    
    loop Pour chaque message en attente
        Client->>API: POST /api/conversations/{id}/messages
        API->>MS: SendMessage(...)
        MS->>MR: Create(message)
        MR->>DB: INSERT INTO instant_messages
        MS-->>API: Message créé
        API-->>Client: 201 Created (message)
        Client->>LDB: Marquer le message comme envoyé
    end
    
    %% Reconnexion WebSocket
    Client->>WSM: WS: Reconnect (token, client_id)
    WSM->>WSM: Register client
    
    %% Mise à jour du statut en ligne
    Client->>API: PUT /api/users/me/status (online: true)
    API->>API: UpdateOnlineStatus(userId, true)
    
    Client->>Client: Mettre à jour lastSyncTime
    Client->>LDB: Sauvegarder lastSyncTime
    Client->>Client: Afficher "Synchronisation terminée"