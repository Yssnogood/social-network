package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes

func GroupsRoutes(r *mux.Router, groupHandler *handlers.GroupHandler) {
	r.HandleFunc("/api/groups", groupHandler.CreateGroup).Methods("POST")
	r.HandleFunc("/api/groups/{id}", groupHandler.GetGroupByID).Methods("GET")
	r.HandleFunc("/api/groups/{id}", groupHandler.UpdateGroup).Methods("PUT")
	r.HandleFunc("/api/groups/{id}", groupHandler.DeleteGroup).Methods("DELETE")
}

