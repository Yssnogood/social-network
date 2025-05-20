# Architecture Multicouche et Application des Principes SOLID (Révisé)

## Architecture Multicouche

L'architecture du projet est organisée en couches distinctes pour séparer clairement les deux systèmes (publications classiques et messagerie instantanée) tout en partageant les fonctionnalités communes.

```
┌─────────────────────────────────────────────────────────────┐
│                      Couche Présentation                     │
├───────────────────────────┬─────────────────────────────────┤
│       Frontend Web        │      Application Electron        │
│       (Next.js)           │       (Optionnelle)             │
└───────────────────────────┴─────────────────────────────────┘
                  │                       │
                  │ HTTP/WebSocket        │
                  ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Couche API                                │
├─────────────────────────────────────────────────────────────┤
│  REST Controllers   │   WebSocket Manager   │   Auth Manager │
└─────────────────────────────────────────────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Couche Services                           │
├───────────────────────┬─────────────────────────────────────┤
│ Système de Publications│     Système de Messagerie           │
│ AuthService           │     ConversationService             │
│ UserService           │     InstantMessageService           │
│ PostService           │     TypingStatusService             │
│ GroupService          │     ReadReceiptService              │
│ EventService          │     MessageSearchService            │
│ NotificationService   │     OfflineSyncService              │
└───────────────────────┴─────────────────────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Couche Repositories                       │
├───────────────────────┬─────────────────────────────────────┤
│ Système de Publications│     Système de Messagerie           │
│ UserRepository        │     ConversationRepository          │
│ PostRepository        │     InstantMessageRepository        │
│ GroupRepository       │     TypingStatusRepository          │
│ EventRepository       │     ReadReceiptRepository           │
│ SessionRepository     │                                     │
│ NotificationRepository│                                     │
└───────────────────────┴─────────────────────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Couche Domain Models                      │
├───────────────────────┬─────────────────────────────────────┤
│ Système de Publications│     Système de Messagerie           │
│ User                  │     Conversation                    │
│ Post, Comment         │     InstantMessage                  │
│ Group, GroupPost      │     TypingStatus                    │
│ Event                 │     ReadReceipt                     │
│ Notification          │                                     │
│ Session               │                                     │
└───────────────────────┴─────────────────────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Couche Data (SQLite)                      │
├─────────────────────────────────────────────────────────────┤
│ Migrations │ SQL Queries │ Data Access                      │
└─────────────────────────────────────────────────────────────┘
```

## Application des Principes SOLID

### S - Single Responsibility Principle

Chaque service et repository a une responsabilité unique et bien définie:

- **Système de Publications**:
  - `PostService`: Gère uniquement la logique des publications et commentaires
  - `GroupService`: Gère uniquement la logique des groupes et membres

- **Système de Messagerie**:
  - `ConversationService`: Gère uniquement les conversations 
  - `InstantMessageService`: Gère uniquement les messages instantanés
  - `TypingStatusService`: Gère uniquement les indicateurs de frappe
  - `ReadReceiptService`: Gère uniquement les accusés de lecture

```go
// Exemple de service avec responsabilité unique
type TypingStatusService struct {
    typingStatusRepo repositories.ITypingStatusRepository
    webSocketManager websocket.IWebSocketManager
}

func (s *TypingStatusService) UpdateTypingStatus(userID, conversationID int) error {
    // Met à jour l'état de frappe
    // Notifie les autres participants via WebSocket
}

func (s *TypingStatusService) GetActiveTypers(conversationID int) ([]models.TypingStatus, error) {
    // Récupère les utilisateurs en train de taper dans la conversation
}
```

### O - Open/Closed Principle

Le système est conçu pour être ouvert à l'extension mais fermé à la modification:

1. **Messages WebSocket extensibles**:
```go
// Structure de base des messages WebSocket
type WebSocketMessage struct {
    Type    string      `json:"type"`
    Payload interface{} `json:"payload"`
    Meta    MessageMeta `json:"meta"`
}

// Types de messages spécifiques (extensible sans modifier le code existant)
const (
    TypeChatMessage     = "chat_message"
    TypeTypingIndicator = "typing_indicator"
    TypeReadReceipt     = "read_receipt"
    TypeStatusUpdate    = "status_update"
    // Nouveaux types peuvent être ajoutés sans modifier le code existant
)
```

2. **Système de notifications adaptable**:
```go
// Enregistrement de handlers pour différents types de notifications
type NotificationHandlerMap map[string]func(notification models.Notification) error

func (s *NotificationService) RegisterHandler(notificationType string, handler func(notification models.Notification) error) {
    s.handlers[notificationType] = handler
}
```

### L - Liskov Substitution Principle

Les implémentations concrètes peuvent remplacer leurs interfaces sans changer le comportement attendu:

```go
// Interface de repository
type IInstantMessageRepository interface {
    GetByID(id int) (*models.InstantMessage, error)
    GetByConversation(conversationID int, pagination Pagination) ([]models.InstantMessage, error)
    Create(message *models.InstantMessage) (*models.InstantMessage, error)
    MarkAsRead(messageID, userID int) error
}

// Implémentation concrète SQLite
type SQLiteInstantMessageRepository struct {
    db *sql.DB
}

// Implémentation concrète pour les tests
type MockInstantMessageRepository struct {
    messages map[int]*models.InstantMessage
}

// Les deux implémentations peuvent être utilisées de manière interchangeable
```

### I - Interface Segregation Principle

Les interfaces sont spécifiques aux besoins de leurs clients:

```go
// Interface spécifique pour la gestion des conversations
type IConversationService interface {
    CreateConversation(creatorID int, name string, isGroup bool, participantIDs []int) (*models.Conversation, error)
    AddParticipant(conversationID, userID int) error
    RemoveParticipant(conversationID, userID int) error
    GetConversations(userID int) ([]models.Conversation, error)
}

// Interface spécifique pour la gestion des messages
type IInstantMessageService interface {
    SendMessage(senderID, conversationID int, content string, imagePath string, referenceMessageID *int) (*models.InstantMessage, error)
    GetMessages(conversationID int, pagination Pagination) ([]models.InstantMessage, error)
    MarkAsRead(messageID, userID int) error
}

// Interface spécifique pour la gestion des indicateurs de frappe
type ITypingStatusService interface {
    UpdateTypingStatus(userID, conversationID int) error
    GetActiveTypers(conversationID int) ([]models.TypingStatus, error)
}
```

### D - Dependency Inversion Principle

Les modules de haut niveau dépendent des abstractions, pas des détails:

```go
// Injection des dépendances via les constructeurs
func NewInstantMessageService(
    repo repositories.IInstantMessageRepository,
    conversationRepo repositories.IConversationRepository,
    wsManager websocket.IWebSocketManager,
    notificationService services.INotificationService,
) services.IInstantMessageService {
    return &InstantMessageService{
        messageRepo:      repo,
        conversationRepo: conversationRepo,
        wsManager:        wsManager,
        notificationSvc:  notificationService,
    }
}

// Utilisation des interfaces au lieu des implémentations concrètes
type InstantMessageService struct {
    messageRepo      repositories.IInstantMessageRepository
    conversationRepo repositories.IConversationRepository
    wsManager        websocket.IWebSocketManager
    notificationSvc  services.INotificationService
}
```

## Stratégies pour le Système de Messagerie Instantanée

### 1. Gestion des Messages avec Référence

Le système permet de répondre directement à un message spécifique grâce au champ `reference_message_id` :

```go
func (s *InstantMessageService) SendMessage(senderID, conversationID int, content string, imagePath string, referenceMessageID *int) (*models.InstantMessage, error) {
    // Vérification que l'utilisateur est bien un participant de la conversation
    isParticipant, err := s.conversationRepo.IsParticipant(conversationID, senderID)
    if err != nil || !isParticipant {
        return nil, ErrNotConversationParticipant
    }
    
    // Création du message
    message := &models.InstantMessage{
        ConversationID:     conversationID,
        SenderID:           senderID,
        Content:            content,
        ImagePath:          imagePath,
        ReferenceMessageID: referenceMessageID,
        IsRead:             false,
        CreatedAt:          time.Now(),
    }
    
    // Enregistrement en base de données
    savedMessage, err := s.messageRepo.Create(message)
    if err != nil {
        return nil, err
    }
    
    // Diffusion aux participants via WebSocket
    s.broadcastMessageToParticipants(savedMessage)
    
    return savedMessage, nil
}
```

### 2. Gestion des Indicateurs de Frappe

Le système diffuse en temps réel les indicateurs de frappe à tous les participants:

```go
func (s *TypingStatusService) UpdateTypingStatus(userID, conversationID int) error {
    // Mise à jour du statut en base de données
    err := s.typingStatusRepo.Update(conversationID, userID)
    if err != nil {
        return err
    }
    
    // Récupération des informations utilisateur
    user, err := s.userRepo.GetByID(userID)
    if err != nil {
        return err
    }
    
    // Diffusion du statut aux autres participants
    message := &websocket.Message{
        Type: websocket.TypeTypingIndicator,
        Payload: map[string]interface{}{
            "conversation_id": conversationID,
            "user_id":         userID,
            "user_name":       user.FirstName + " " + user.LastName,
            "timestamp":       time.Now().Unix(),
        },
    }
    
    // Diffuser à tous les participants sauf l'expéditeur
    participants, _ := s.conversationRepo.GetParticipants(conversationID)
    for _, participant := range participants {
        if participant.UserID != userID {
            s.wsManager.BroadcastToUser(participant.UserID, message)
        }
    }
    
    return nil
}
```

### 3. Gestion du Mode Hors Ligne pour Electron

L'application Electron peut fonctionner en mode hors ligne grâce à une synchronisation locale:

```go
// Côté serveur (API)
func (h *MessagingHandler) GetUndeliveredMessages(w http.ResponseWriter, r *http.Request) {
    userID := getUserIDFromContext(r)
    lastSyncTime := r.URL.Query().Get("last_sync")
    
    t, err := time.Parse(time.RFC3339, lastSyncTime)
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid last_sync format")
        return
    }
    
    // Récupérer tous les messages non lus ou créés après la dernière synchronisation
    messages, err := h.messageSvc.GetUndeliveredMessages(userID, t)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, err.Error())
        return
    }
    
    respondWithJSON(w, http.StatusOK, messages)
}

// Côté client (Electron)
class OfflineManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.db = new LocalDatabase();
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || new Date(0).toISOString();
        this.isOnline = navigator.onLine;
        
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }
    
    async handleOnline() {
        this.isOnline = true;
        
        // Notifier l'UI
        document.dispatchEvent(new CustomEvent('connection-status-change', { detail: { isOnline: true } }));
        
        // Synchroniser les messages
        await this.synchronize();
        
        // Envoyer les messages en attente
        await this.sendQueuedMessages();
    }
    
    handleOffline() {
        this.isOnline = false;
        
        // Notifier l'UI
        document.dispatchEvent(new CustomEvent('connection-status-change', { detail: { isOnline: false } }));
    }
    
    async synchronize() {
        try {
            // Récupérer les messages non livrés depuis la dernière synchronisation
            const messages = await this.apiClient.getUndeliveredMessages(this.lastSyncTime);
            
            // Stocker les messages dans la base de données locale
            await this.db.storeMessages(messages);
            
            // Mettre à jour la date de dernière synchronisation
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
            // Notifier l'UI des nouveaux messages
            document.dispatchEvent(new CustomEvent('messages-synchronized', { detail: { count: messages.length } }));
            
            return messages;
        } catch (error) {
            console.error('Synchronization failed:', error);
            throw error;
        }
    }
    
    async sendQueuedMessages() {
        // Récupérer les messages en attente d'envoi
        const queuedMessages = await this.db.getQueuedMessages();
        
        for (const message of queuedMessages) {
            try {
                // Envoyer le message via l'API
                const sentMessage = await this.apiClient.sendMessage(
                    message.conversationId,
                    message.content,
                    message.imagePath,
                    message.referenceMessageId
                );
                
                // Mettre à jour le message local avec l'ID serveur
                await this.db.updateQueuedMessage(message.localId, sentMessage);
                
            } catch (error) {
                console.error(`Failed to send queued message ${message.localId}:`, error);
                // Conserver le message dans la file d'attente pour une tentative ultérieure
            }
        }
    }
    
    async queueMessageForSending(conversationId, content, imagePath, referenceMessageId) {
        // Créer un ID local temporaire
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Créer le message local
        const message = {
            localId,
            conversationId,
            content,
            imagePath,
            referenceMessageId,
            senderId: this.apiClient.getCurrentUserId(),
            status: 'queued',
            createdAt: new Date().toISOString()
        };
        
        // Stocker le message dans la base de données locale
        await this.db.addQueuedMessage(message);
        
        // Si en ligne, essayer d'envoyer immédiatement
        if (this.isOnline) {
            this.sendQueuedMessages();
        }
        
        return message;
    }
}
```

### 4. Recherche de Messages

L'application Electron implémente un moteur de recherche pour les messages:

```typescript
class MessageSearchEngine {
    constructor(db) {
        this.db = db;
        this.indexedDB = null;
        this.initIndex();
    }
    
    async initIndex() {
        // Initialiser la base de données d'index
        this.indexedDB = await new Promise((resolve, reject) => {
            const request = window.indexedDB.open('message-search-index', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Créer un store d'objets pour l'index
                const store = db.createObjectStore('messages', { keyPath: 'id' });
                
                // Créer des index pour la recherche
                store.createIndex('content', 'content', { multiEntry: true });
                store.createIndex('sender', 'sender', { multiEntry: true });
                store.createIndex('conversation', 'conversation', { multiEntry: false });
                store.createIndex('date', 'date', { multiEntry: false });
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        // Indexer les messages existants
        await this.indexExistingMessages();
    }
    
    async indexExistingMessages() {
        const messages = await this.db.getAllMessages();
        
        const transaction = this.indexedDB.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        
        for (const message of messages) {
            await this.indexMessage(store, message);
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        });
    }
    
    async indexMessage(store, message) {
        // Préparer les données pour l'indexation
        const indexData = {
            id: message.id,
            content: this.tokenize(message.content),
            sender: message.senderName,
            conversation: message.conversationId,
            date: new Date(message.createdAt).getTime()
        };
        
        // Ajouter à l'index
        store.put(indexData);
    }
    
    tokenize(text) {
        // Convertir en minuscules et diviser en mots
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }
    
    async search(query, options = {}) {
        const { conversationId, senderId, startDate, endDate } = options;
        const tokens = this.tokenize(query);
        
        return new Promise((resolve, reject) => {
            const results = new Map();
            const transaction = this.indexedDB.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const contentIndex = store.index('content');
            
            // Chercher chaque token dans l'index
            let pendingRequests = tokens.length;
            
            tokens.forEach(token => {
                const range = IDBKeyRange.bound(token, token + '\uffff');
                const request = contentIndex.openCursor(range);
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    
                    if (cursor) {
                        const message = cursor.value;
                        
                        // Appliquer les filtres
                        let matches = true;
                        
                        if (conversationId && message.conversation !== conversationId) {
                            matches = false;
                        }
                        
                        if (senderId && message.sender !== senderId) {
                            matches = false;
                        }
                        
                        if (startDate && message.date < startDate) {
                            matches = false;
                        }
                        
                        if (endDate && message.date > endDate) {
                            matches = false;
                        }
                        
                        if (matches) {
                            // Incrémenter le score pour ce message
                            const score = (results.get(message.id) || 0) + 1;
                            results.set(message.id, score);
                        }
                        
                        cursor.continue();
                    } else {
                        pendingRequests--;
                        
                        if (pendingRequests === 0) {
                            // Tous les tokens ont été traités, récupérer les messages complets
                            this.fetchMessagesByIds(Array.from(results.keys()))
                                .then(messages => {
                                    // Trier par score (nombre de tokens correspondants) puis par date
                                    messages.sort((a, b) => {
                                        const scoreA = results.get(a.id);
                                        const scoreB = results.get(b.id);
                                        
                                        if (scoreB !== scoreA) {
                                            return scoreB - scoreA;
                                        }
                                        
                                        return new Date(b.createdAt) - new Date(a.createdAt);
                                    });
                                    
                                    resolve(messages);
                                })
                                .catch(reject);
                        }
                    }
                };
                
                request.onerror = reject;
            });
        });
    }
    
    async fetchMessagesByIds(ids) {
        return this.db.getMessagesByIds(ids);
    }
}
```

## Évolution du Système

Cette architecture facilite l'évolution du système vers l'application Electron car:

1. **Séparation claire des domaines**: Le système de messagerie instantanée est déjà distinct du système de publications classiques, permettant à l'application Electron de se concentrer uniquement sur la messagerie.

2. **APIs dédiées**: Des endpoints spécifiques sont prévus pour les besoins de l'application Electron, notamment pour la synchronisation et le mode hors ligne.

3. **WebSockets adaptés**: Le protocole WebSocket est conçu pour être compatible avec différents clients (web et desktop), avec une gestion fine des connexions multiples et des états de présence.

4. **Interfaces cohérentes**: Les interfaces sont définies de manière à faciliter l'implémentation des clients, qu'ils soient web ou desktop.