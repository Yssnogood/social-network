package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"social-network/backend/app/services"
	repository "social-network/backend/database/repositories"
	"social-network/backend/database/sqlite"
	appHandlers "social-network/backend/server/handlers"
	"social-network/backend/server/routes"
	"social-network/backend/websocket"
)

func main() {
	r := mux.NewRouter()

	// Try multiple paths for .env file
	envPaths := []string{
		".env",                    // from project root
		"../../../.env",          // from backend/cmd/server
		"../../.env",             // from backend/
		"/Users/jacquesaupepin/Documents/javaScript/social-network/.env", // absolute path
	}
	
	var err error
	loaded := false
	for _, path := range envPaths {
		err = godotenv.Load(path)
		if err == nil {
			log.Printf("Loaded .env from: %s", path)
			loaded = true
			break
		}
	}
	
	if !loaded {
		log.Printf("Could not load .env from any path. Last error: %v", err)
		log.Fatal("Could not load .env file")
	}

	// Appliquer le middleware CORS
	headersOk := gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	// Récupérer les origins autorisées depuis .env
	allowedOriginsEnv := os.Getenv("ALLOWED_ORIGINS")
	if allowedOriginsEnv == "" {
		allowedOriginsEnv = "http://localhost:3000" // valeur par défaut
	}
	allowedOrigins := strings.Split(allowedOriginsEnv, ",")
	log.Println("ALLOWED_ORIGINS loaded:", allowedOriginsEnv)
	log.Println("Parsed origins:", allowedOrigins)

	originsOk := gorillaHandlers.AllowedOrigins(allowedOrigins)
	credentialsOk := gorillaHandlers.AllowCredentials()
	methodsOk := gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"})

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
	notificationRepo := repository.NewNotificationRepository(db)
	eventRepo := repository.NewEventRepository(db)

	// Services
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)

	// WebSocket routes - unified system (crée le Hub d'abord)
	wsHub := websocket.SetupWebSocketRoutes(r, messageRepo, conversationRepo, conversationMembersRepo, groupRepo, eventRepo, userRepo)

	// Handlers (EventHandler reçoit maintenant le Hub pour broadcast temps réel)
	userHandler := appHandlers.NewUserHandler(userService, userRepo, sessionRepo)
	postHandler := appHandlers.NewPostHandler(postService, postRepo, sessionRepo, userRepo)
	commentHandler := appHandlers.NewCommentHandler(commentRepo, sessionRepo, userRepo)
	followerHandler := appHandlers.NewFollowerHandler(followerRepo, notificationRepo)
	messageHandler := appHandlers.NewMessageHandler(messageRepo, conversationRepo, conversationMembersRepo)
	notificationHandler := appHandlers.NewNotificationHandler(notificationRepo, followerRepo, groupRepo)
	eventHandler := appHandlers.NewEventHandler(eventRepo, userRepo, wsHub) // 🎯 Ajout du Hub WebSocket
	uploadHandler := appHandlers.NewUploadHandler("./uploads")

	groupHandler := appHandlers.NewGroupHandler(groupRepo, sessionRepo, userRepo, notificationRepo)
	invitationHandler := appHandlers.NewInvitationHandler(groupRepo, sessionRepo, userRepo, notificationRepo)

	// CORS handled by Gorilla handlers at the end

	// Routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	routes.CommentsRoutes(r, commentHandler)
	routes.FollowersRoutes(r, followerHandler)
	routes.GroupRoutes(r, groupHandler)
	routes.InvitationRoutes(r, invitationHandler)
	routes.MessageRoutes(r, messageHandler)
	routes.NotificationsRoutes(r, notificationHandler)
	routes.EventsRoutes(r, eventHandler)
	routes.UploadRoutes(r, uploadHandler)

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
