sequenceDiagram
    participant Client1 as Client Web/Electron (Émetteur)
    participant Client2 as Client Web/Electron (Récepteur)
    participant API as API REST
    participant WSM as WebSocketManager
    participant MS as MessagingService
    participant TS as TypingStatusService
    participant IMR as InstantMessageRepository
    participant TSR as TypingStatusRepository
    participant NS as NotificationService
    participant DB as Base de données SQLite

    %% Phase 1: Indication de frappe (typing)
    Client1->>WSM: WS: {"type": "typing_indicator", "payload": {"conversation_id": 123}}
    WSM->>TS: UpdateTypingStatus(userId, conversationId)
    TS->>TSR: Update(conversationId, userId)
    TSR->>DB: INSERT/UPDATE typing_status
    WSM->>Client2: WS: {"type": "typing_indicator", "payload": {"user_id": userId, "conversation_id": 123}}
    Client2->>Client2: Afficher indicateur "<User> est en train d'écrire..."

    %% Phase 2: Envoi du message référençant un autre message
    Client1->>API: POST /api/conversations/123/messages (content, reference_message_id)
    API->>MS: SendMessage(senderId, conversationId, content, null, referenceMessageId)
    MS->>IMR: Create(message)
    IMR->>DB: INSERT INTO instant_messages
    DB-->>IMR: message_id
    IMR-->>MS: Created Message
    
    %% Phase 3: Notification et diffusion
    MS->>NS: CreateNotification(receiverId, MESSAGE_TYPE, messageId, "message")
    NS->>DB: INSERT INTO notifications
    MS->>WSM: BroadcastToConversation(conversationId, message)
    
    %% Phase 4: Réception et affichage spécial pour les messages référencés
    WSM->>Client2: WS: {"type": "chat_message", "payload": {..., "reference_message_id": refId}}
    Client2->>Client2: Récupérer le message référencé
    Client2->>Client2: Afficher le message avec référence en en-tête
    
    %% Phase 5: Accusé de lecture
    Client2->>API: POST /api/messages/{message_id}/read
    API->>MS: MarkMessageAsRead(messageId, userId)
    MS->>IMR: MarkAsRead(messageId, userId)
    IMR->>DB: INSERT INTO read_receipts
    MS->>WSM: BroadcastToUser(senderId, readReceipt)
    WSM->>Client1: WS: {"type": "read_receipt", "payload": {...}}
    Client1->>Client1: Mettre à jour l'UI avec l'accusé de lecture

    %% Phase 6: Gestion mode hors ligne (Electron)
    alt Le récepteur est hors ligne
        WSM->>WSM: Enregistrer dans la file d'attente hors ligne
        Client2->>Client2: Passe en mode hors ligne
        Client2->>Client2: Stocke localement les derniers messages
        Client2->>Client2: Affiche "Mode hors ligne"
        
        Note over Client2: Reconnexion ultérieure
        Client2->>API: GET /api/messages/undelivered
        API->>IMR: GetUnreadMessages(userId)
        IMR->>DB: SELECT FROM instant_messages WHERE conversation_id IN (user's conversations) AND created_at > last_sync
        DB-->>IMR: Unread/new messages
        IMR-->>API: Messages à synchroniser
        API-->>Client2: Liste des messages à synchroniser
        Client2->>Client2: Mise à jour de la base locale
        Client2->>Client2: Affichage des messages avec références
    end
