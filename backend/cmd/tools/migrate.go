package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run migrate.go [up|down|drop]")
	}
	command := os.Args[1]

	dbPath := "backend/database/sqlite/data.db"
	migrationsPath := "backend/database/migrations/sqlite"

	// Connexion à la base
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("❌ Cannot open database: %v", err)
	}
	defer db.Close()

	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		log.Fatalf("❌ Cannot create driver: %v", err)
	}

	absPath, err := filepath.Abs(migrationsPath)
	if err != nil {
		log.Fatalf("❌ Cannot resolve migration path: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance("file://"+absPath, "sqlite3", driver)
	if err != nil {
		log.Fatalf("❌ Cannot create migrator: %v", err)
	}

	switch command {
	case "up":
		fmt.Println("Applying migrations...")
		if err := m.Up(); err != nil && err.Error() != "no change" {
			log.Fatalf("Migration up failed: %v", err)
		}
		fmt.Println("Migrations applied.")
	case "alldown":
		fmt.Println("Rolling back all migration...")
		if err := m.Steps(-19); err != nil {
			log.Fatalf("Migration down failed: %v", err)
		}
		fmt.Println("Rolled all migration.")
	case "reset":
		fmt.Println("Resetting all migrations (down + up)...")
		if err := m.Steps(-19); err != nil && err.Error() != "no change" {
			log.Fatalf("Down failed: %v", err)
		}
		fmt.Println("All migrations rolled back.")
		if err := m.Up(); err != nil && err.Error() != "no change" {
			log.Fatalf("Up failed: %v", err)
		}
		fmt.Println("Migrations re-applied.")

	default:
		log.Fatalf("Unknown command: %s (use up | alldown | reset)", command)
	}
}
