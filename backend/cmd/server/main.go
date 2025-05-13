package main

import (
	"log"

	"github.com/joho/godotenv"
	"os"
	"social-network/backend/database/sqlite"
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
}
