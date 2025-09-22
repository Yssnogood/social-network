package main

import (
	"log"
	"net/http"
	"os"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

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

	// CORS global
	headersOk := gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	originsOk := gorillaHandlers.AllowedOrigins([]string{"http://localhost:3000"})
	credentialsOk := gorillaHandlers.AllowCredentials()
	methodsOk := gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"})
	r.Use(middlewares.CORSMiddleware)

	// Charger .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Erreur loading .env")
	}
	log.Println("DB_PATH =", os.Getenv("DB_PATH"))

	// Initialisation DB
	db := sqlite.InitDBAndMigrate()
	defer db.Close()
	log.Println("Serveur ready")

	// =========================
	// Repositories
	// =========================
	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	followerRepo := repository.NewFollowerRepository(db)
	messageRepo := repository.NewMessageRepository(db)
	conversationRepo := repository.NewConversationRepository(db)
	conversationMembersRepo := repository.NewConversationMembersRepository(db)
	groupRepo := repository.NewGroupRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	eventRepo := repository.NewEventRepository(db)

	// =========================
	// Services
	// =========================
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)

	// =========================
	// Handlers
	// =========================
	userHandler := appHandlers.NewUserHandler(userService, userRepo, sessionRepo)
	postHandler := appHandlers.NewPostHandler(postService, postRepo, sessionRepo, userRepo)
	commentHandler := appHandlers.NewCommentHandler(commentRepo, sessionRepo)
	followerHandler := appHandlers.NewFollowerHandler(followerRepo, notificationRepo, userRepo)
	messageHandler := appHandlers.NewMessageHandler(messageRepo, conversationRepo, conversationMembersRepo)
	websocketHandler := websocket.NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo, notificationRepo)
	notificationHandler := appHandlers.NewNotificationHandler(notificationRepo, followerRepo, groupRepo)
	eventHandler := appHandlers.NewEventHandler(eventRepo, groupRepo)

	eventHandler := appHandlers.NewEventHandler(eventRepo)
	groupHandler := appHandlers.NewGroupHandler(groupRepo, sessionRepo, userRepo, notificationRepo)

	// =========================
	// Routes publiques
	// =========================
	routes.UserRoutes(r, userHandler) // Inscription / login peuvent rester publiques

	// =========================
	// Routes protégées (JWTMiddleware)
	// =========================
	protected := r.NewRoute().Subrouter()
	protected.Use(middlewares.JWTMiddleware) // Applique le middleware JWT à tout le sousrouter

	routes.PostRoutes(protected, postHandler)
	routes.CommentsRoutes(protected, commentHandler)
	routes.FollowersRoutes(protected, followerHandler)
	routes.GroupRoutes(protected, groupHandler)
	routes.MessageRoutes(protected, messageHandler)
	routes.NotificationsRoutes(protected, notificationHandler)
	routes.EventsRoutes(protected, eventHandler)

	// =========================
	// WebSocket sécurisé
	// =========================
	protected.Handle("/ws", http.HandlerFunc(websocketHandler.HandleWebSocket)).Methods("GET", "OPTIONS")
	protected.Handle("/ws/groups", http.HandlerFunc(appHandlers.HandleGroupWebSocket))
	protected.Handle("/messages/conversation", http.HandlerFunc(websocketHandler.HandleGetConversation)).Methods("POST", "OPTIONS")

	// =========================
	// Lancement serveur
	// =========================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server start on http://localhost:" + port + "/")
	if err := http.ListenAndServe(":"+port, gorillaHandlers.CORS(originsOk, headersOk, methodsOk, credentialsOk)(r)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
