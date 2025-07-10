package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	gorillaHandlers "github.com/gorilla/handlers"

	"social-network/backend/app/services"
	repository "social-network/backend/database/repositories"
	"social-network/backend/database/sqlite"
	appHandlers "social-network/backend/server/handlers"

	"social-network/backend/server/middlewares"
	"social-network/backend/server/routes"
	"social-network/backend/websocket"
)

func main() {
	r := mux.NewRouter()

	// Appliquer le middleware CORS
	headersOk := gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	originsOk := gorillaHandlers.AllowedOrigins([]string{"http://localhost:3000"})
	credentialsOk := gorillaHandlers.AllowCredentials()
	methodsOk := gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"})

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
	groupRepo := repository.NewGroupRepository(db)

	// Services
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)

	// Handlers
	userHandler := appHandlers.NewUserHandler(userService, userRepo, sessionRepo)
	postHandler := appHandlers.NewPostHandler(postService, postRepo, sessionRepo, userRepo)
	commentHandler := appHandlers.NewCommentHandler(commentRepo, sessionRepo)
	followerHandler := appHandlers.NewFollowerHandler(followerRepo)
	messageHandler := appHandlers.NewMessageHandler(messageRepo, conversationRepo, conversationMembersRepo)
	websocketHandler := websocket.NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo)

	groupHandler := appHandlers.NewGroupHandler(groupRepo, sessionRepo, userRepo)

	// CORS
	r.Use(middlewares.CORSMiddleware)

	// Routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	routes.CommentsRoutes(r, commentHandler)
	routes.FollowersRoutes(r, followerHandler)
	routes.GroupRoutes(r, groupHandler)
	routes.MessageRoutes(r, messageHandler)


	// WebSocket
	wsHandler := middlewares.JWTMiddleware(http.HandlerFunc(websocketHandler.HandleWebSocket))
	r.Handle("/ws", wsHandler).Methods("GET", "OPTIONS")
	
	r.Handle("/ws/groups", middlewares.JWTMiddleware(http.HandlerFunc(appHandlers.HandleGroupWebSocket)))

	r.Handle("/api/messages/conversation", middlewares.CORSMiddleware(
		http.HandlerFunc(websocketHandler.HandleGetConversation),
	)).Methods("POST", "OPTIONS")

	// Lancement du serveur HTTP
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server start on http://localhost:" + port + "/")
	if err := http.ListenAndServe(":"+port, gorillaHandlers.CORS(originsOk, headersOk, methodsOk, credentialsOk)(r)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}