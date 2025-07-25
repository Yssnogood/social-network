package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes

func NotificationsRoutes(r *mux.Router, notificationHandler *handlers.NotificationHandler) {
	r.HandleFunc("/api/notifications", notificationHandler.CreateNotification).Methods("POST")
	r.HandleFunc("/api/notifications/get", notificationHandler.GetAllNotificationsForUser).Methods("POST")
	r.HandleFunc("/api/notifications/{id}", notificationHandler.GetNotification).Methods("GET")
	r.HandleFunc("/api/notifications/{id}", notificationHandler.UpdateNotification).Methods("PUT")
	r.HandleFunc("/api/notifications/{id}", notificationHandler.DeleteNotification).Methods("DELETE")
}
