sequenceDiagram
    participant Client1 as Client Émetteur
    participant Client2 as Client Récepteur
    participant Client3 as Autres Participants
    participant API as API REST
    participant WSM as WebSocketManager
    participant CS as ConversationService
    participant CR as ConversationRepository
    participant MS as InstantMessageService
    participant MR as InstantMessageRepository
    participant TS as TypingStatusService
    participant TSR as TypingStatusRepository
    participant RRS as ReadReceiptService
    participant RRR as ReadReceiptRepository
    participant NS as NotificationService
    participant DB as Base de données SQLite

    %% Phase 1: Création d'une conversation de groupe
    Client1->>API: POST /api/conversations (name, is_group, participant_ids[])
    API->>CS: CreateConversation(creatorId, name, isGroup, participantIds)
    CS->>CR: Create(conversation)
    CR->>DB: INSERT INTO conversations
    DB-->>CR: conversation_id
    
    loop Pour chaque participant
        CS->>CR: AddParticipant(conversationId, participantId)
        CR->>DB: INSERT INTO conversation_participants
    end
    
    CS->>NS: NotifyParticipants(conversationId, CONVERSATION_CREATED)
    NS->>WSM: BroadcastToMultipleUsers(participantIds, notification)
    WSM->>Client2: WS: {"type": "notification", "payload": {...}}
    WSM->>Client3: WS: {"type": "notification", "payload": {...}}
    CS-->>API: Conversation créée
    API-->>Client1: 201 Created (conversation)

    %% Phase 2: Envoi d'indicateur de frappe
    Client1->>WSM: WS: {"type": "typing_indicator", "payload": {"conversation_id": conversationId}}
    WSM->>TS: UpdateTypingStatus(userId, conversationId)
    TS->>TSR: Update(conversationId, userId)
    TSR->>DB: INSERT/UPDATE typing_status
    TS->>CR: GetParticipants(conversationId)
    CR->>DB: SELECT FROM conversation_participants WHERE conversation_id = ?
    DB-->>CR: participants
    CR-->>TS: participants
    
    loop Pour chaque participant (sauf l'émetteur)
        TS->>WSM: BroadcastToUser(participantId, typingStatus)
    end
    
    WSM->>Client2: WS: {"type": "typing_indicator", "payload": {"user_id": userId, "conversation_id": conversationId}}
    WSM->>Client3: WS: {"type": "typing_indicator", "payload": {"user_id": userId, "conversation_id": conversationId}}
    Client2->>Client2: Afficher "<User> est en train d'écrire..."
    Client3->>Client3: Afficher "<User> est en train d'écrire..."

    %% Phase 3: Envoi du message
    Client1->>API: POST /api/conversations/{conversation_id}/messages (content, image_path, reference_message_id)
    API->>MS: SendMessage(senderId, conversationId, content, imagePath, referenceMessageId)
    MS->>MR: Create(message)
    MR->>DB: INSERT INTO instant_messages
    DB-->>MR: message_id
    MR-->>MS: Created Message
    
    MS->>CR: GetParticipants(conversationId)
    CR->>DB: SELECT FROM conversation_participants WHERE conversation_id = ?
    DB-->>CR: participants
    CR-->>MS: participants
    
    %% Suppression de l'indicateur de frappe
    MS->>TS: ClearTypingStatus(senderId, conversationId)
    TS->>TSR: Delete(conversationId, userId)
    TSR->>DB: DELETE FROM typing_status WHERE conversation_id = ? AND user_id = ?
    
    %% Envoi des notifications
    loop Pour chaque participant (sauf l'émetteur)
        MS->>NS: CreateNotification(participantId, MESSAGE_TYPE, messageId, "message")
        NS->>DB: INSERT INTO notifications
    end
    
    %% Diffusion du message
    MS->>WSM: BroadcastToConversation(conversationId, message)
    WSM->>Client2: WS: {"type": "chat_message", "payload": {...}}
    WSM->>Client3: WS: {"type": "chat_message", "payload": {...}}
    
    %% Si c'est une réponse à un message précédent
    alt referenceMessageId !== null
        Client2->>Client2: Récupérer et afficher le message référencé 
        Client3->>Client3: Récupérer et afficher le message référencé
    end
    
    MS-->>API: Message envoyé
    API-->>Client1: 201 Created (message)

    %% Phase 4: Lecture du message
    Client2->>API: POST /api/messages/{message_id}/read
    API->>RRS: MarkMessageAsRead(messageId, userId)
    RRS->>RRR: Create(messageId, userId)
    RRR->>DB: INSERT INTO read_receipts
    RRS->>MR: MarkAsRead(messageId, userId)
    MR->>DB: UPDATE instant_messages SET is_read = true WHERE id = ?
    
    %% Envoi de l'accusé de lecture
    RRS->>WSM: BroadcastReadReceipt(messageId, userId, conversationId)
    WSM->>Client1: WS: {"type": "read_receipt", "payload": {"message_id": messageId, "user_id": userId}}
    WSM->>Client3: WS: {"type": "read_receipt", "payload": {"message_id": messageId, "user_id": userId}}
    
    Client1->>Client1: Mettre à jour l'UI (accusé de lecture)
    Client3->>Client3: Mettre à jour l'UI (accusé de lecture)
    
    RRS-->>API: Message marqué comme lu
    API-->>Client2: 200 OK