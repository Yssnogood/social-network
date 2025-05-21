package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"social-network/backend/database/sqlite"
	"social-network/backend/server/handlers"
	"social-network/backend/app/services"
	"social-network/backend/database/repositories"
	"social-network/backend/server/routes"
	"social-network/backend/server/middlewares"
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
	// commentRepo := repository.NewCommentRepository(db)
	// notificationRepo := repository.NewNotificationRepository(db)
	// messageRepo := repository.NewMessageRepository(db)
	// sessionRepo := repository.NewSessionRepository(db)
	// followerRepo := repository.NewFollowerRepository(db)
	// groupRepo := repository.NewGroupRepository(db)
	// eventRepo := repository.NewEventRepository(db)


	// Services
	userService := services.NewUserService(db)
	// postService := services.NewPostService(db)
	// commentService := services.NewCommentService(db)
	// notificationService := services.NewNotificationService(db)
	// messageService := services.NewMessageService(db)
	// sessionService := services.NewSessionService(db)
	// followerService := services.NewFollowerService(db)
	// groupService := services.NewGroupService(db)
	// eventService := services.NewEventService(db)

	// Handlers
	userHandler := handlers.NewUserHandler(userService, userRepo)
	postHandler := handlers.NewPostHandler(postRepo)
	// commentHandler := handlers.NewCommentHandler(commentRepo)
	// notificationHandler := handlers.NewNotificationHandler(notificationRepo)
	// messageHandler := handlers.NewMessageHandler(messageRepo)
	// sessionHandler := handlers.NewSessionHandler(sessionRepo)
	// followerHandler := handlers.NewFollowerHandler(followerRepo)
	// groupHandler := handlers.NewGroupHandler(groupRepo)
	// eventHandler := handlers.NewEventHandler(eventRepo)

	// Create a new router
	r := mux.NewRouter()

	//routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	// routes.CommentsRoutes(r, commentHandler)
	// routes.NotificationRoutes(r, notificationHandler)
	// routes.MessageRoutes(r, messageHandler)
	// routes.SessionRoutes(r, sessionHandler)
	// routes.FollowerRoutes(r, followerHandler)
	// routes.GroupRoutes(r, groupHandler)
	// routes.EventRoutes(r, eventHandler)

	// Middleware
	r.Handle("/api/posts", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.CreatePost))).Methods("POST")


	// start serveur
	log.Println("Serveur en écoute sur :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("Erreur au lancement du serveur :", err)
	}
}
