package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	repository "social-network/backend/database/repositories"
	"social-network/backend/database/sqlite"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
	"social-network/backend/server/routes"
	"social-network/backend/websocket"
	"social-network/backend/app/services"
)

func main() {
	// Chargement des variables d’environnement
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur loading .env")
	}

	log.Println("DB_PATH =", os.Getenv("DB_PATH"))

	// Initialisation de la base de données
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
	websocketHandler := websocket.NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo)


	// Router
	r := mux.NewRouter()

	// Routes API
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	routes.CommentsRoutes(r, commentHandler)
	routes.FollowersRoutes(r, followerHandler)

	r.Handle("/api/posts", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.CreatePost))).Methods("POST")

	// Route WebSocket sécurisée avec middleware JWT
	r.Handle("/ws", middlewares.JWTMiddleware(http.HandlerFunc(websocketHandler.HandleWebSocket))).Methods("GET")

	r.Use(middlewares.CORSMiddleware)


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
