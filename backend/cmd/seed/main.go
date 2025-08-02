package main

import (
	"fmt"
	"log"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"social-network/backend/database/models"
	"social-network/backend/database/sqlite"
)

func main() {
	fmt.Println("🌱 Starting database seeding...")

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Initialize database
	db := sqlite.InitDBAndMigrate()
	defer db.Close()

	// Hash password for all users
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("1234"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Error hashing password:", err)
	}

	now := time.Now()
	
	// Helper function to parse dates
	parseDate := func(dateStr string) time.Time {
		t, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			log.Fatal("Error parsing date:", err)
		}
		return t
	}
	
	users := []models.User{
		{
			Username:     "nono",
			Email:        "nono@gmail.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Nono",
			LastName:     "Dupont",
			BirthDate:    parseDate("1995-05-15"),
			AboutMe:      "Je suis nono, j'aime les réseaux sociaux !",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "alice",
			Email:        "alice@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Alice",
			LastName:     "Martin",
			BirthDate:    parseDate("1992-03-20"),
			AboutMe:      "Développeuse passionnée de technologie",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "bob",
			Email:        "bob@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Bob",
			LastName:     "Wilson",
			BirthDate:    parseDate("1988-11-10"),
			AboutMe:      "Amateur de photographie et de voyages",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "charlie",
			Email:        "charlie@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Charlie",
			LastName:     "Brown",
			BirthDate:    parseDate("1990-07-25"),
			AboutMe:      "Musicien et créateur de contenu",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "diana",
			Email:        "diana@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Diana",
			LastName:     "Garcia",
			BirthDate:    parseDate("1993-12-08"),
			AboutMe:      "Artiste et designer graphique",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "ethan",
			Email:        "ethan@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Ethan",
			LastName:     "Taylor",
			BirthDate:    parseDate("1989-09-14"),
			AboutMe:      "Chef cuisinier et foodie",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "fiona",
			Email:        "fiona@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "Fiona",
			LastName:     "Chen",
			BirthDate:    parseDate("1994-04-18"),
			AboutMe:      "Étudiante en médecine et bénévole",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			Username:     "george",
			Email:        "george@example.com",
			PasswordHash: string(passwordHash),
			FirstName:    "George",
			LastName:     "Smith",
			BirthDate:    parseDate("1991-01-30"),
			AboutMe:      "Entrepreneur et passionné de sport",
			IsPublic:     true,
			AvatarPath:   "/defaultPP.webp",
			CreatedAt:    now,
			UpdatedAt:    now,
		},
	}

	// Insert users (check if they exist first)
	var userIDs []int64
	for _, user := range users {
		// Check if user already exists
		var existingID int64
		err := db.QueryRow("SELECT id FROM users WHERE username = ? OR email = ?", user.Username, user.Email).Scan(&existingID)
		
		if err == nil {
			// User exists, use existing ID
			userIDs = append(userIDs, existingID)
			fmt.Printf("ℹ️ User %s already exists (ID: %d)\n", user.Username, existingID)
			continue
		}

		// User doesn't exist, create new one
		stmt, err := db.Prepare(`
			INSERT INTO users (
				username, email, password_hash, first_name, last_name, 
				birth_date, about_me, is_public, avatar_path, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		if err != nil {
			log.Printf("Error preparing user insert for %s: %v", user.Username, err)
			continue
		}

		result, err := stmt.Exec(
			user.Username, user.Email, user.PasswordHash, user.FirstName, user.LastName,
			user.BirthDate, user.AboutMe, user.IsPublic, user.AvatarPath, user.CreatedAt, user.UpdatedAt,
		)
		stmt.Close()

		if err != nil {
			log.Printf("Error inserting user %s: %v", user.Username, err)
			continue
		}

		userID, _ := result.LastInsertId()
		userIDs = append(userIDs, userID)
		fmt.Printf("✅ Created user: %s (ID: %d)\n", user.Username, userID)
	}

	if len(userIDs) == 0 {
		log.Fatal("No users were created successfully")
	}

	// nono's ID should be the first one
	nonoID := userIDs[0]

	// Create mutual following relationships: nono follows others and they follow back
	followRelations := []struct {
		followerID int64
		followedID int64
	}{
		// nono follows others
		{nonoID, userIDs[1]}, // nono -> alice
		{nonoID, userIDs[2]}, // nono -> bob
		{nonoID, userIDs[3]}, // nono -> charlie
		{nonoID, userIDs[4]}, // nono -> diana
		{nonoID, userIDs[5]}, // nono -> ethan
		
		// others follow nono back
		{userIDs[1], nonoID}, // alice -> nono
		{userIDs[2], nonoID}, // bob -> nono
		{userIDs[3], nonoID}, // charlie -> nono
		{userIDs[4], nonoID}, // diana -> nono
		{userIDs[5], nonoID}, // ethan -> nono
		
		// Some additional cross-relationships
		{userIDs[1], userIDs[2]}, // alice -> bob
		{userIDs[2], userIDs[1]}, // bob -> alice
		{userIDs[3], userIDs[4]}, // charlie -> diana
		{userIDs[4], userIDs[3]}, // diana -> charlie
	}

	// Insert follow relationships (check for existing ones)
	for _, relation := range followRelations {
		// Check if relationship already exists
		var existingCount int
		err := db.QueryRow("SELECT COUNT(*) FROM followers WHERE follower_id = ? AND followed_id = ?", 
			relation.followerID, relation.followedID).Scan(&existingCount)
		
		if err == nil && existingCount > 0 {
			fmt.Printf("ℹ️ Follow relation %d -> %d already exists\n", 
				relation.followerID, relation.followedID)
			continue
		}

		stmt, err := db.Prepare(`
			INSERT INTO followers (follower_id, followed_id, accepted, followed_at) 
			VALUES (?, ?, 1, ?)
		`)
		if err != nil {
			log.Printf("Error preparing follow insert: %v", err)
			continue
		}

		_, err = stmt.Exec(relation.followerID, relation.followedID, now)
		stmt.Close()

		if err != nil {
			log.Printf("Error inserting follow relation %d -> %d: %v", 
				relation.followerID, relation.followedID, err)
			continue
		}

		fmt.Printf("✅ Created follow relation: %d -> %d\n", 
			relation.followerID, relation.followedID)
	}

	// Create some sample posts
	posts := []struct {
		userID  int64
		content string
	}{
		{nonoID, "Salut tout le monde ! Je suis nouveau ici 👋"},
		{userIDs[1], "Belle journée pour coder ! 💻"},
		{userIDs[2], "Photo de mon dernier voyage en montagne 🏔️"},
		{userIDs[3], "Nouveau morceau en cours de composition 🎵"},
		{nonoID, "Merci à tous mes nouveaux amis ! 🙏"},
		{userIDs[4], "Design du jour terminé ✨"},
		{userIDs[5], "Recette du jour : pasta aux champignons 🍝"},
		{nonoID, "Quelle belle communauté ici ! ❤️"},
	}

	for _, post := range posts {
		stmt, err := db.Prepare(`
			INSERT INTO posts (user_id, content, privacy_type, created_at, updated_at) 
			VALUES (?, ?, 0, ?, ?)
		`)
		if err != nil {
			log.Printf("Error preparing post insert: %v", err)
			continue
		}

		_, err = stmt.Exec(post.userID, post.content, now, now)
		stmt.Close()

		if err != nil {
			log.Printf("Error inserting post: %v", err)
			continue
		}

		truncated := post.content
		if len(post.content) > 30 {
			truncated = post.content[:30] + "..."
		}
		fmt.Printf("✅ Created post by user %d: %s\n", post.userID, truncated)
	}

	fmt.Println("\n🎉 Database seeding completed successfully!")
	fmt.Println("\n📊 Summary:")
	fmt.Printf("- %d users created\n", len(users))
	fmt.Printf("- %d follow relationships created\n", len(followRelations))
	fmt.Printf("- %d posts created\n", len(posts))
	fmt.Println("\n🔐 Login credentials:")
	fmt.Println("- Username: nono")
	fmt.Println("- Email: nono@gmail.com") 
	fmt.Println("- Password: 1234")
	fmt.Println("\n💡 All other users also have password: 1234")
}