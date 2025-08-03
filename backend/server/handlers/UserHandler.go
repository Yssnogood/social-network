package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"social-network/backend/app/services"
	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// UserHandler is a handler for managing users.
type UserHandler struct {
	UserService       *services.UserService
	UserRepository    *repository.UserRepository
	SessionRepository *repository.SessionRepository
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(us *services.UserService, ur *repository.UserRepository, sr *repository.SessionRepository) *UserHandler {
	return &UserHandler{
		UserService:       us,
		UserRepository:    ur,
		SessionRepository: sr,
	}
}

// createUserRequest is the request body for creating a user.
type createUserRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	BirthDate string `json:"birth_date"`
	Username  string `json:"username"`
	AboutMe   string `json:"about_me"`
	IsPublic  bool   `json:"is_public"`
}

// getUserRequest defines the request body for getting a user.
type getUserRequest struct {
	JWT string `json:"jwt"`
}

// getUserRequest defines the request body for getting a user.
type getCurrentUserRequest struct {
	JWT string `json:"jwt"`
}

// updateUserRequest defines the fields allowed for user update.
type updateUserRequest struct {
	ID         int64  `json:"id"`
	Email      string `json:"email"`
	Password   string `json:"password,omitempty"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	BirthDate  string `json:"birth_date"`
	Username   string `json:"username"`
	AboutMe    string `json:"about_me"`
	IsPublic   bool   `json:"is_public"`
	AvatarPath string `json:"avatar_path"`
}

// deleteUserRequest defines the request body for deleting a user.
type deleteUserRequest struct {
	ID int64 `json:"id"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type logoutRequest struct {
	JWT string `json:"jwt"`
}

// Login handles user login.
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.UserRepository.GetByEmail(req.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if !h.UserService.CheckPasswordHash(req.Password, user.PasswordHash) {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Génère le JWT
	token, err := h.UserService.GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	session := &models.Session{
		UserID:       user.ID,
		SessionToken: token,
		CreatedAt:    time.Now(),
		ExpiresAt:    time.Now().Add(time.Hour * 24),
	}
	h.SessionRepository.Create(session)

	// // Écrit le token dans un cookie sécurisé
	// http.SetCookie(w, &http.Cookie{
	// 	Name:     "jwt",
	// 	Value:    token,
	// 	Path:     "/",
	// 	HttpOnly: true,
	// 	Secure:   false, // à mettre sur true en HTTPS
	// 	SameSite: http.SameSiteLaxMode,
	// 	MaxAge:   86400, // 24h
	// })

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"jwt":     token,
		"user":    user.Username,
	})
}

// Logout handles user logout.
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req logoutRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	h.SessionRepository.Delete(session.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}

// CreateUser create a new user.
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req createUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Request invalid", http.StatusBadRequest)
		return
	}

	if err := h.UserService.ValidateEmail(req.Email); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := h.UserService.HashPassword(req.Password)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error hash password", http.StatusInternalServerError)
		return
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		http.Error(w, "Format invalid. Use YYYY-MM-DD.", http.StatusBadRequest)
		return
	}

	user := &models.User{
		AvatarPath:   "https://res.cloudinary.com/dc2729t5d/image/upload/v1750498050/olqkqou632nntamawsuk.webp",
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		BirthDate:    birthDate,
		Username:     req.Username,
		AboutMe:      req.AboutMe,
		IsPublic:     req.IsPublic,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = h.UserRepository.Create(user)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Erreur create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully",
		"user_id": user.ID,
	})
}

func (h *UserHandler) GetUserFriends(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	users, err := h.UserRepository.GetFriendsByUserID(userID)
	if err != nil {
		http.Error(w, "Failed to fetch users: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	path := r.URL.Path
	prefix := "/api/users/search/"

	if !strings.HasPrefix(path, prefix) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	val := strings.TrimPrefix(path, prefix)
	name := strings.TrimSpace(val)[0:strings.Index(val, "/")]
	current, _ := strconv.Atoi(strings.Split(val, "/")[1])

	users, err := h.UserRepository.GetUsersForContact(int64(current), name)
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) Search(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	// Vérifie que la méthode est bien POST
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Parse le body JSON
	var requestData struct {
		Query   string `json:"query"`
		Current int    `json:"current"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Corps de requête invalide", http.StatusBadRequest)
		return
	}

	if requestData.Query == "" || requestData.Current == 0 {
		http.Error(w, "Les champs 'query' et 'current' sont requis", http.StatusBadRequest)
		return
	}

	users, groups, err := h.UserRepository.SearchInstance(requestData.Query, requestData.Current)
	if err != nil {
		http.Error(w, "Erreur lors de la recherche", http.StatusInternalServerError)
		return
	}

	response := repository.SearchGroupedResult{
		Users:  users,
		Groups: groups,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Erreur lors de l'encodage JSON", http.StatusInternalServerError)
		return
	}
}

// GetUser retrieves a user by Username from the request.
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req getUserRequest

	username := path.Base((r.URL.Path))

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	_, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	user, err := h.UserRepository.GetByUserName(username)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// GetUser retrieves a user by ID from JSON body.
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middlewares.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.UserRepository.GetByID(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// UpdateUser updates user information using JSON body.
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req updateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.UserRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	user.Email = req.Email
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Username = req.Username
	user.AboutMe = req.AboutMe
	user.AvatarPath = req.AvatarPath
	user.IsPublic = req.IsPublic
	user.UpdatedAt = time.Now()

	if req.Password != "" {
		hashedPassword, err := h.UserService.HashPassword(req.Password)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}
		user.PasswordHash = hashedPassword
	} else {
		user.PasswordHash = req.Password
	}

	birthDate, err := time.Parse("2006-01-02T15:04:05Z", req.BirthDate)
	if err != nil {
		http.Error(w, "Invalid birth date format. Use YYYY-MM-DD.", http.StatusBadRequest)
		return
	}
	user.BirthDate = birthDate

	if err := h.UserRepository.Update(user); err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "User updated successfully",
	})
}

// DeleteUser deletes a user by ID from JSON body.
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req deleteUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.UserRepository.Delete(req.ID)
	if err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User deleted successfully",
	})
}
