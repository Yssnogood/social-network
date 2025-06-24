package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)

func FollowersRoutes(r *mux.Router, followerHandler *handlers.FollowerHandler) {
	r.HandleFunc("/api/followers", followerHandler.CreateFollower).Methods("POST")
	r.HandleFunc("/api/followers", followerHandler.GetFollowers).Methods("GET")
	r.HandleFunc("/api/followers/{id}", followerHandler.DeleteFollower).Methods("DELETE")
}
