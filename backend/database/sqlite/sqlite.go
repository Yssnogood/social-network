package sqlite

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

func InitDBAndMigrate() *sql.DB {
	// Get the database path from the environment variable
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		log.Fatal("Environment variable DB_PATH is not set")
	}

	// Open a SQLite connection
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Cannot open SQLite database: %v", err)
	}

	// active les foreign keys
	_, err = db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Fatal("Impossible d’activer les foreign keys :", err)
	}

	// Prepare the driver for migrations
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		log.Fatalf("Cannot create SQLite migration driver: %v", err)
	}

	// Resolve the absolute path to the migration files
	// Check if we're running from project root or backend directory
	migrationsPath := "database/migrations/sqlite"
	if _, err := os.Stat(migrationsPath); os.IsNotExist(err) {
		// Try from project root
		migrationsPath = "backend/database/migrations/sqlite"
	}
	
	absPath, err := filepath.Abs(migrationsPath)
	if err != nil {
		log.Fatalf("Cannot resolve absolute path for migrations: %v", err)
	}

	// Apply the migrations
	m, err := migrate.NewWithDatabaseInstance(
		"file://"+absPath,
		"sqlite3", driver)
	if err != nil {
		log.Fatalf("Migration init failed: %v", err)
	}

	if err := m.Up(); err != nil && err.Error() != "no change" {
		log.Fatalf("Migration failed: %v", err)
	}

	fmt.Println("Migrations applied successfully")
	return db
}
