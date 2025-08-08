package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"social-network/backend/server/middlewares"
)

// UploadHandler handles file upload operations
type UploadHandler struct {
	// Upload directory path
	UploadDir string
}

// NewUploadHandler creates a new UploadHandler
func NewUploadHandler(uploadDir string) *UploadHandler {
	// Ensure upload directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Printf("Failed to create upload directory: %v\n", err)
	}
	
	return &UploadHandler{
		UploadDir: uploadDir,
	}
}

// UploadImage handles image upload for groups and events
func (h *UploadHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	// Check authentication
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Parse multipart form (10MB max)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the file from form
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Failed to get image from form: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	contentType := handler.Header.Get("Content-Type")
	if !isValidImageType(contentType) {
		http.Error(w, "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed", http.StatusBadRequest)
		return
	}

	// Validate file size (max 5MB)
	if handler.Size > 5<<20 {
		http.Error(w, "File too large. Maximum size is 5MB", http.StatusBadRequest)
		return
	}

	// Generate unique filename
	filename := generateUniqueFilename(handler.Filename, userID)
	filepath := filepath.Join(h.UploadDir, filename)

	// Create the file on disk
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to create file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy uploaded file to destination
	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the file path
	response := map[string]string{
		"image_path": "/uploads/" + filename,
		"filename":   filename,
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"image_path":"%s","filename":"%s"}`, response["image_path"], response["filename"])
}

// isValidImageType checks if the content type is a valid image type
func isValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/gif",
		"image/webp",
	}
	
	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

// generateUniqueFilename generates a unique filename to avoid conflicts
func generateUniqueFilename(originalFilename string, userID int64) string {
	// Get file extension
	ext := filepath.Ext(originalFilename)
	
	// Generate timestamp-based filename
	timestamp := time.Now().Unix()
	
	// Format: userid_timestamp.ext
	return fmt.Sprintf("%d_%d%s", userID, timestamp, ext)
}