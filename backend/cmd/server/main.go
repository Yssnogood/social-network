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

	// Services
	userService := services.NewUserService(db)

	// Handlers
	userHandler := handlers.NewUserHandler(userService, userRepo)
	postHandler := handlers.NewPostHandler(postRepo)

	r := mux.NewRouter()

	//routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)

	// start serveur
	log.Println("Serveur en écoute sur :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("Erreur au lancement du serveur :", err)
	}
}
