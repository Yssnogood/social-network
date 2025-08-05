package websocket

import (
	"encoding/json"
	"log"
	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
	"sync"
	"time"
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Clients by user ID for direct messaging
	userClients map[int64]*Client

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Repository interfaces
	messageRepo             repository.MessageRepositoryInterface
	conversationRepo        repository.ConversationRepositoryInterface
	conversationMembersRepo repository.ConversationMemberRepositoryInterface

	// Mutex for thread-safe operations
	mutex sync.RWMutex
}

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type           string    `json:"type"`
	ConversationID int64     `json:"conversation_id,omitempty"`
	Content        string    `json:"content,omitempty"`
	SenderID       int64     `json:"sender_id,omitempty"`
	ReceiverID     int64     `json:"receiver_id,omitempty"`
	MessageID      int64     `json:"message_id,omitempty"`
	Timestamp      time.Time `json:"timestamp,omitempty"`
	Error          string    `json:"error,omitempty"`
}

// NewHub creates a new WebSocket hub
func NewHub(
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
) *Hub {
	return &Hub{
		clients:                 make(map[*Client]bool),
		userClients:             make(map[int64]*Client),
		broadcast:               make(chan []byte),
		register:                make(chan *Client),
		unregister:              make(chan *Client),
		messageRepo:             messageRepo,
		conversationRepo:        conversationRepo,
		conversationMembersRepo: conversationMembersRepo,
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.handleBroadcast(message)
		}
	}
}

// registerClient registers a new client
func (h *Hub) registerClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	h.clients[client] = true
	h.userClients[client.UserID] = client

	log.Printf("Client registered: UserID %d", client.UserID)

	// Send connection confirmation
	response := WSMessage{
		Type:      "connection_success",
		Timestamp: time.Now(),
	}
	h.sendToClient(client, response)
}

// unregisterClient unregisters a client
func (h *Hub) unregisterClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		delete(h.userClients, client.UserID)
		close(client.send)

		log.Printf("Client unregistered: UserID %d", client.UserID)
	}
}

// handleBroadcast processes broadcast messages
func (h *Hub) handleBroadcast(message []byte) {
	var wsMsg WSMessage
	if err := json.Unmarshal(message, &wsMsg); err != nil {
		log.Printf("Error unmarshaling broadcast message: %v", err)
		return
	}

	switch wsMsg.Type {
	case "message_send":
		h.handleMessageSend(wsMsg)
	case "presence":
		h.handlePresence(wsMsg)
	default:
		log.Printf("Unknown message type: %s", wsMsg.Type)
	}
}

// handlePresence processes presence messages for online status
func (h *Hub) handlePresence(wsMsg WSMessage) {
	log.Printf("User %d presence update: %s", wsMsg.SenderID, wsMsg.Content)
	// La présence est déjà gérée par l'enregistrement/désenregistrement du client
	// Ceci confirme juste que l'utilisateur est actif
}

// handleMessageSend processes new message sending between two users
func (h *Hub) handleMessageSend(wsMsg WSMessage) {
	// Find or create conversation between two users
	conversation, err := h.conversationRepo.CreateOrGetPrivateConversation(wsMsg.SenderID, wsMsg.ReceiverID)
	if err != nil {
		log.Printf("Error creating/getting conversation: %v", err)
		return
	}

	// Create message in database
	message := &models.Message{
		ConversationID: conversation.ID,
		SenderID:       wsMsg.SenderID,
		ReceiverID:     wsMsg.ReceiverID,
		Content:        wsMsg.Content,
		CreatedAt:      time.Now(),
	}

	messageID, err := h.messageRepo.Create(message)
	if err != nil {
		log.Printf("Error creating message: %v", err)
		return
	}

	// Update conversation timestamp
	h.conversationRepo.UpdatedAt(conversation.ID)

	// Prepare response message
	response := WSMessage{
		Type:           "message_received",
		ConversationID: conversation.ID,
		Content:        wsMsg.Content,
		SenderID:       wsMsg.SenderID,
		ReceiverID:     wsMsg.ReceiverID,
		MessageID:      messageID,
		Timestamp:      message.CreatedAt,
	}

	// Send to both sender and receiver
	h.sendToUser(wsMsg.SenderID, response)
	h.sendToUser(wsMsg.ReceiverID, response)
}


// sendToUser sends a message to a specific user
func (h *Hub) sendToUser(userID int64, message WSMessage) {
	h.mutex.RLock()
	client, exists := h.userClients[userID]
	h.mutex.RUnlock()

	if !exists {
		log.Printf("User %d is not connected", userID)
		return
	}

	h.sendToClient(client, message)
}

// sendToClient sends a message to a specific client
func (h *Hub) sendToClient(client *Client, message WSMessage) {
	messageBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	select {
	case client.send <- messageBytes:
	default:
		// Client's send channel is full, close it
		h.unregisterClient(client)
	}
}

// GetOnlineUserIDs returns a slice of user IDs that are currently online
func (h *Hub) GetOnlineUserIDs() []int64 {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	userIDs := make([]int64, 0, len(h.userClients))
	for userID := range h.userClients {
		userIDs = append(userIDs, userID)
	}
	return userIDs
}

// IsUserOnline checks if a specific user is currently online
func (h *Hub) IsUserOnline(userID int64) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	_, exists := h.userClients[userID]
	return exists
}

