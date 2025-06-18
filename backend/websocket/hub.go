package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
	"social-network/backend/database/repositories"
	"social-network/backend/database/models"
)

type Hub struct {
	Clients       map[*Client]bool
	Register      chan *Client
	Unregister    chan *Client
	Broadcast     chan []byte

	MessageRepo       *repository.MessageRepository
	ConversationRepo  *repository.ConversationRepository
}

func NewHub(messageRepo *repository.MessageRepository, conversationRepo *repository.ConversationRepository) *Hub {
	return &Hub{
		Clients:          make(map[*Client]bool),
		Register:         make(chan *Client),
		Unregister:       make(chan *Client),
		Broadcast:        make(chan []byte),
		MessageRepo:      messageRepo,
		ConversationRepo: conversationRepo,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
			fmt.Printf("Client connected: %s\n", client.ID)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
				fmt.Printf("Client disconnected: %s\n", client.ID)
			}

		case message := <-h.Broadcast:
			h.handleMessage(message)
		}
	}
}

func (h *Hub) handleMessage(rawMessage []byte) {
	var wsMessage WebSocketMessage
	if err := json.Unmarshal(rawMessage, &wsMessage); err != nil {
		log.Printf("Error unmarshaling message: %v", err)
		return
	}

	switch wsMessage.Type {
	case "new_message":
		h.handleNewMessage(wsMessage.Payload)
	case "typing":
		h.handleTyping(wsMessage.Payload)
	case "message_read":
		h.handleMessageRead(wsMessage.Payload)
	default:
		log.Printf("Unknown message type: %s", wsMessage.Type)
	}
}

func (h *Hub) handleNewMessage(payload interface{}) {
	payloadBytes, _ := json.Marshal(payload)
	var newMsg NewMessagePayload
	if err := json.Unmarshal(payloadBytes, &newMsg); err != nil {
		log.Printf("Error parsing new message payload: %v", err)
		return
	}

	message := &models.Message{
		ConversationID: newMsg.ConversationID,
		SenderID:       newMsg.SenderID,
		ReceiverID:     newMsg.ReceiverID,
		GroupID:        newMsg.GroupID,
		Content:        newMsg.Content,
		CreatedAt:      time.Now(),
	}

	_, err := h.MessageRepo.Create(message)
	if err != nil {
		log.Printf("Error saving message: %v", err)
		return
	}

	sentPayload := MessageSentPayload{Message: *message}
	wsMsg, _ := NewWebSocketMessage("message_sent", sentPayload)
	msgBytes, _ := wsMsg.ToJSON()

	h.sendToConversationMembers(newMsg.ConversationID, msgBytes)
}

func (h *Hub) handleTyping(payload interface{}) {
	payloadBytes, _ := json.Marshal(payload)
	var typing TypingPayload
	if err := json.Unmarshal(payloadBytes, &typing); err != nil {
		log.Printf("Error parsing typing payload: %v", err)
		return
	}

	wsMsg, _ := NewWebSocketMessage("user_typing", typing)
	msgBytes, _ := wsMsg.ToJSON()

	h.sendToConversationMembers(typing.ConversationID, msgBytes)
}

func (h *Hub) handleMessageRead(payload interface{}) {
	payloadBytes, _ := json.Marshal(payload)
	var msgRead MessageReadPayload
	if err := json.Unmarshal(payloadBytes, &msgRead); err != nil {
		log.Printf("Error parsing message read payload: %v", err)
		return
	}

	if err := h.MessageRepo.MarkAsRead(msgRead.MessageID, msgRead.ReadAt); err != nil {
		log.Printf("Error marking message as read: %v", err)
		return
	}

	conversationID, err := h.MessageRepo.GetConversationID(msgRead.MessageID)
	if err != nil {
		log.Printf("Error getting conversation ID: %v", err)
		return
	}

	wsMsg, _ := NewWebSocketMessage("message_read_confirmation", msgRead)
	msgBytes, _ := wsMsg.ToJSON()

	h.sendToConversationMembers(conversationID, msgBytes)
}

func (h *Hub) sendToConversationMembers(conversationID int64, message []byte) {
	members, err := h.ConversationRepo.GetMembers(conversationID)
	if err != nil {
		log.Printf("Error getting conversation members: %v", err)
		return
	}

	for client := range h.Clients {
		for _, member := range members {
			if client.UserID == member.UserID {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
					log.Printf("Client %s has been removed due to a failed send", client.ID)
				}
				break
			}
		}
	}
}
