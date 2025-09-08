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

	// Clients by group ID for group messaging
	groupClients map[int64]map[*Client]bool
	
	// Clients by event ID for event messaging
	eventClients map[int64]map[*Client]bool

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
	groupRepo              repository.GroupRepositoryInterface
	eventRepo              repository.EventRepositoryInterface
	userRepo               repository.UserRepositoryInterface

	// Mutex for thread-safe operations
	mutex sync.RWMutex
}

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type           string    `json:"type"`
	ConversationID int64     `json:"conversation_id,omitempty"`
	GroupID        int64     `json:"group_id,omitempty"`
	EventID        int64     `json:"event_id,omitempty"`
	Content        string    `json:"content,omitempty"`
	SenderID       int64     `json:"sender_id,omitempty"`
	ReceiverID     int64     `json:"receiver_id,omitempty"`
	MessageID      int64     `json:"message_id,omitempty"`
	Username       string    `json:"username,omitempty"`
	Timestamp      time.Time `json:"timestamp,omitempty"`
	Error          string    `json:"error,omitempty"`
	// Champs spécifiques aux notifications
	NotificationID   *int64  `json:"notification_id,omitempty"`
	NotificationType *string `json:"notification_type,omitempty"`
	Read             *bool   `json:"read,omitempty"`
	ReferenceID      *int64  `json:"reference_id,omitempty"`
	ReferenceType    *string `json:"reference_type,omitempty"`
}

// NewHub creates a new WebSocket hub
func NewHub(
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
	groupRepo repository.GroupRepositoryInterface,
	eventRepo repository.EventRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
) *Hub {
	return &Hub{
		clients:                 make(map[*Client]bool),
		userClients:             make(map[int64]*Client),
		groupClients:            make(map[int64]map[*Client]bool),
		eventClients:            make(map[int64]map[*Client]bool),
		broadcast:               make(chan []byte),
		register:                make(chan *Client),
		unregister:              make(chan *Client),
		messageRepo:             messageRepo,
		conversationRepo:        conversationRepo,
		conversationMembersRepo: conversationMembersRepo,
		groupRepo:              groupRepo,
		eventRepo:              eventRepo,
		userRepo:               userRepo,
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
		
		// Remove client from all groups
		for groupID, groupClients := range h.groupClients {
			if _, exists := groupClients[client]; exists {
				delete(groupClients, client)
				// If no more clients in the group, remove the group
				if len(groupClients) == 0 {
					delete(h.groupClients, groupID)
				}
			}
		}
		
		// Remove client from all events
		for eventID, eventClients := range h.eventClients {
			if _, exists := eventClients[client]; exists {
				delete(eventClients, client)
				// If no more clients in the event, remove the event
				if len(eventClients) == 0 {
					delete(h.eventClients, eventID)
				}
			}
		}
		
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
	case "group_message":
		h.handleGroupMessage(wsMsg)
	case "group_join":
		h.handleGroupJoin(wsMsg)
	case "group_leave":
		h.handleGroupLeave(wsMsg)
	case "event_message":
		h.handleEventMessage(wsMsg)
	case "event_join":
		h.handleEventJoin(wsMsg)
	case "event_leave":
		h.handleEventLeave(wsMsg)
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

// handleGroupMessage processes group message sending
func (h *Hub) handleGroupMessage(wsMsg WSMessage) {
	// Get username from the database
	username, err := h.getUsernameByID(wsMsg.SenderID)
	if err != nil {
		log.Printf("Error getting username: %v", err)
		return
	}

	// Create group message in database
	groupMessage := &models.GroupMessage{
		GroupID:   wsMsg.GroupID,
		UserID:    wsMsg.SenderID,
		Username:  username,
		Content:   wsMsg.Content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	messageID, err := h.groupRepo.CreateGroupMessage(groupMessage)
	if err != nil {
		log.Printf("Error creating group message: %v", err)
		return
	}

	// Prepare response message
	response := WSMessage{
		Type:      "group_message_received",
		GroupID:   wsMsg.GroupID,
		Content:   wsMsg.Content,
		SenderID:  wsMsg.SenderID,
		Username:  username,
		MessageID: messageID,
		Timestamp: groupMessage.CreatedAt,
	}

	// Broadcast to all clients in the group
	h.broadcastToGroup(wsMsg.GroupID, response)
}

// handleGroupJoin processes a client joining a group
func (h *Hub) handleGroupJoin(wsMsg WSMessage) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	client, exists := h.userClients[wsMsg.SenderID]
	if !exists {
		log.Printf("User %d not connected", wsMsg.SenderID)
		return
	}

	// Initialize group if it doesn't exist
	if h.groupClients[wsMsg.GroupID] == nil {
		h.groupClients[wsMsg.GroupID] = make(map[*Client]bool)
	}

	// Add client to group
	h.groupClients[wsMsg.GroupID][client] = true

	log.Printf("User %d joined group %d", wsMsg.SenderID, wsMsg.GroupID)

	// Send confirmation
	response := WSMessage{
		Type:      "group_join_success",
		GroupID:   wsMsg.GroupID,
		Timestamp: time.Now(),
	}
	h.sendToClient(client, response)
}

// handleGroupLeave processes a client leaving a group
func (h *Hub) handleGroupLeave(wsMsg WSMessage) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	client, exists := h.userClients[wsMsg.SenderID]
	if !exists {
		log.Printf("User %d not connected", wsMsg.SenderID)
		return
	}

	// Remove client from group
	if groupClients, groupExists := h.groupClients[wsMsg.GroupID]; groupExists {
		delete(groupClients, client)
		
		// If no more clients in the group, remove the group
		if len(groupClients) == 0 {
			delete(h.groupClients, wsMsg.GroupID)
		}
	}

	log.Printf("User %d left group %d", wsMsg.SenderID, wsMsg.GroupID)

	// Send confirmation
	response := WSMessage{
		Type:      "group_leave_success",
		GroupID:   wsMsg.GroupID,
		Timestamp: time.Now(),
	}
	h.sendToClient(client, response)
}

// broadcastToGroup sends a message to all clients in a group
func (h *Hub) broadcastToGroup(groupID int64, message WSMessage) {
	h.mutex.RLock()
	groupClients, exists := h.groupClients[groupID]
	h.mutex.RUnlock()

	if !exists {
		log.Printf("No clients in group %d", groupID)
		return
	}

	for client := range groupClients {
		h.sendToClient(client, message)
	}
}

// getUsernameByID retrieves username from user ID using repositories
func (h *Hub) getUsernameByID(userID int64) (string, error) {
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		return "", err
	}
	return user.Username, nil
}

// handleEventMessage processes event message sending
func (h *Hub) handleEventMessage(wsMsg WSMessage) {
	// Get username from the database
	username, err := h.getUsernameByID(wsMsg.SenderID)
	if err != nil {
		log.Printf("Error getting username: %v", err)
		return
	}

	// Create event message in database
	eventMessage := &models.EventMessage{
		EventID:   wsMsg.EventID,
		UserID:    wsMsg.SenderID,
		Username:  username,
		Content:   wsMsg.Content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	messageID, err := h.eventRepo.CreateEventMessage(eventMessage)
	if err != nil {
		log.Printf("Error creating event message: %v", err)
		return
	}

	// Prepare response message
	response := WSMessage{
		Type:      "event_message_received",
		EventID:   wsMsg.EventID,
		Content:   wsMsg.Content,
		SenderID:  wsMsg.SenderID,
		Username:  username,
		MessageID: messageID,
		Timestamp: eventMessage.CreatedAt,
	}

	// Broadcast to all clients in the event
	h.broadcastToEvent(wsMsg.EventID, response)
}

// handleEventJoin processes a client joining an event
func (h *Hub) handleEventJoin(wsMsg WSMessage) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	client, exists := h.userClients[wsMsg.SenderID]
	if !exists {
		log.Printf("User %d not connected", wsMsg.SenderID)
		return
	}

	// Initialize event if it doesn't exist
	if h.eventClients[wsMsg.EventID] == nil {
		h.eventClients[wsMsg.EventID] = make(map[*Client]bool)
	}

	// Add client to event
	h.eventClients[wsMsg.EventID][client] = true

	log.Printf("User %d joined event %d", wsMsg.SenderID, wsMsg.EventID)

	// Send confirmation
	response := WSMessage{
		Type:      "event_join_success",
		EventID:   wsMsg.EventID,
		Timestamp: time.Now(),
	}
	h.sendToClient(client, response)
}

// handleEventLeave processes a client leaving an event
func (h *Hub) handleEventLeave(wsMsg WSMessage) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	client, exists := h.userClients[wsMsg.SenderID]
	if !exists {
		log.Printf("User %d not connected", wsMsg.SenderID)
		return
	}

	// Remove client from event
	if eventClients, eventExists := h.eventClients[wsMsg.EventID]; eventExists {
		delete(eventClients, client)
		
		// If no more clients in the event, remove the event
		if len(eventClients) == 0 {
			delete(h.eventClients, wsMsg.EventID)
		}
	}

	log.Printf("User %d left event %d", wsMsg.SenderID, wsMsg.EventID)

	// Send confirmation
	response := WSMessage{
		Type:      "event_leave_success",
		EventID:   wsMsg.EventID,
		Timestamp: time.Now(),
	}
	h.sendToClient(client, response)
}

// broadcastToEvent sends a message to all clients in an event
func (h *Hub) broadcastToEvent(eventID int64, message WSMessage) {
	h.mutex.RLock()
	eventClients, exists := h.eventClients[eventID]
	h.mutex.RUnlock()

	if !exists {
		log.Printf("No clients in event %d", eventID)
		return
	}

	for client := range eventClients {
		h.sendToClient(client, message)
	}
}

// BroadcastToEvent sends a message to all clients in an event (public method for handlers)
func (h *Hub) BroadcastToEvent(eventID int64, message WSMessage) {
	h.broadcastToEvent(eventID, message)
}

// SendToUser sends a message to a specific user (public method for handlers)
func (h *Hub) SendToUser(userID int64, message WSMessage) {
	h.sendToUser(userID, message)
}
