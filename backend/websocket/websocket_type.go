package websocket

import (
	"encoding/json"
	"time"
	"social-network/backend/database/models"
)

type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type NewMessagePayload struct {
	ConversationID int64  `json:"conversation_id"`
	ReceiverID     int64  `json:"receiver_id,omitempty"`
	GroupID        *int64 `json:"group_id,omitempty"`
	Content        string `json:"content"`
	SenderID       int64  `json:"sender_id"`
}

type MessageSentPayload struct {
	Message models.Message `json:"message"`
}

type TypingPayload struct {
	ConversationID int64 `json:"conversation_id"`
	UserID         int64 `json:"user_id"`
	IsTyping       bool  `json:"is_typing"`
}

type MessageReadPayload struct {
	MessageID int64     `json:"message_id"`
	ReadAt    time.Time `json:"read_at"`
}

func NewWebSocketMessage(msgType string, payload interface{}) (*WebSocketMessage, error) {
	return &WebSocketMessage{
		Type:    msgType,
		Payload: payload,
	}, nil
}

func (wsm *WebSocketMessage) ToJSON() ([]byte, error) {
	return json.Marshal(wsm)
}