package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/app/services"
	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// UserHandler is a handler for managing users.
type UserHandler struct {
	UserService    *services.UserService
	UserRepository *repository.UserRepository
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(us *services.UserService, ur *repository.UserRepository) *UserHandler {
	return &UserHandler{
		UserService:    us,
		UserRepository: ur,
	}
}

// createUserRequest is the request body for creating a user.
type createUserRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	BirthDate string `json:"birth_date"`
	Nickname  string `json:"nickname"`
	AboutMe   string `json:"about_me"`
	IsPublic  bool   `json:"is_public"`
}

// getUserRequest defines the request body for getting a user.
type getUserRequest struct {
	ID int64 `json:"id"`
}

// updateUserRequest defines the fields allowed for user update.
type updateUserRequest struct {
	ID        int64  `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"password,omitempty"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	BirthDate string `json:"birth_date"`
	Nickname  string `json:"nickname"`
	AboutMe   string `json:"about_me"`
	IsPublic  bool   `json:"is_public"`
}

// deleteUserRequest defines the request body for deleting a user.
type deleteUserRequest struct {
	ID int64 `json:"id"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

// Login handles user login.
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

	// Écrit le token dans un cookie sécurisé
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // à mettre sur true en HTTPS
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400, // 24h
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
	})
}


// Logout handles user logout.
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}


// CreateUser create a new user.
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "Error hash password", http.StatusInternalServerError)
		return
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		http.Error(w, "Format invalid. Use YYYY-MM-DD.", http.StatusBadRequest)
		return
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		BirthDate:    birthDate,
		Nickname:     req.Nickname,
		AboutMe:      req.AboutMe,
		IsPublic:     req.IsPublic,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = h.UserRepository.Create(user)
	if err != nil {
		http.Error(w, "Erreur create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully",
		"user_id": user.ID,
	})
}

// GetUser retrieves a user by ID from JSON body.
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	var req getUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.UserRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// UpdateUser updates user information using JSON body.
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
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
	user.Nickname = req.Nickname
	user.AboutMe = req.AboutMe
	user.IsPublic = req.IsPublic
	user.UpdatedAt = time.Now()

	if req.Password != "" {
		hashedPassword, err := h.UserService.HashPassword(req.Password)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}
		user.PasswordHash = hashedPassword
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
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
