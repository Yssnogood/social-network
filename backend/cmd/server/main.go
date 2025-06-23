package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"social-network/backend/app/services"
	repository "social-network/backend/database/repositories"
	"social-network/backend/database/sqlite"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
	"social-network/backend/server/routes"
	"social-network/backend/websocket"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur loading .env")
	}

	log.Println("DB_PATH =", os.Getenv("DB_PATH"))

	db := sqlite.InitDBAndMigrate()
	defer db.Close()

	log.Println("Serveur ready")

	// Repositories
	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	followerRepo := repository.NewFollowerRepository(db)
	messageRepo := repository.NewMessageRepository(db)
	conversationRepo := repository.NewConversationRepository(db)
	conversationMembersRepo := repository.NewConversationMembersRepository(db)

	// Services
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)

	// Handlers
	userHandler := handlers.NewUserHandler(userService, userRepo, sessionRepo)
	postHandler := handlers.NewPostHandler(postService, postRepo, sessionRepo)
	commentHandler := handlers.NewCommentHandler(commentRepo, sessionRepo)
	followerHandler := handlers.NewFollowerHandler(followerRepo)
	messageHandler := handlers.NewMessageHandler(messageRepo, conversationRepo, conversationMembersRepo)
	websocketHandler := websocket.NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo)

	// Router
	r := mux.NewRouter()

	// CORS
	r.Use(middlewares.CORSMiddleware)

	// Routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	routes.CommentsRoutes(r, commentHandler)
	routes.FollowersRoutes(r, followerHandler)

	r.Handle("/api/posts", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.CreatePost))).Methods("POST", "OPTIONS")

	// WebSocket
	wsHandler := middlewares.JWTMiddleware(http.HandlerFunc(websocketHandler.HandleWebSocket))
	r.Handle("/ws", wsHandler).Methods("GET", "OPTIONS")

	r.Handle("/api/messages/conversation", middlewares.CORSMiddleware(
		http.HandlerFunc(websocketHandler.HandleGetConversation),
	)).Methods("POST", "OPTIONS")

	routes.MessageRoutes(r, messageHandler)

	// Lancement du serveur HTTP
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Serveur en écoute sur :" + port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Erreur au lancement du serveur :", err)
	}
}
