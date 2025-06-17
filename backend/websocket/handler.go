package websocket

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
	"social-network/backend/database/repositories"
)

var GlobalHub = NewHub()

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(hub *Hub, sessionRepo *repository.SessionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie("session_token")
		if err != nil {
			http.Error(w, "Missing Session", http.StatusUnauthorized)
			return
		}

		session, err := sessionRepo.GetBySessionToken(cookie.Value)
		if err != nil {
			http.Error(w, "invalid Session", http.StatusUnauthorized)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Error WebSocket upgrade:", err)
			return
		}

		client := &Client{
			ID:   strconv.FormatInt(session.UserID, 10), // conversion int64 -> string
			Conn: conn,
			Send: make(chan []byte, 256),
			Hub:  hub,
		}

		hub.Register <- client

		go client.writePump()
		go client.readPump()
	}
}
