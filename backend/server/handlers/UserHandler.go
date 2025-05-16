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
		http.Error(w, "Erreur lors de la création de l'utilisateur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully",
		"user_id": user.ID,
	})
}


