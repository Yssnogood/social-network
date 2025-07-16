package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
	"net/http"
	"social-network/backend/server/middlewares"
)

func FollowersRoutes(r *mux.Router, followerHandler *handlers.FollowerHandler) {
	r.HandleFunc("/api/followers", followerHandler.CreateFollower).Methods("POST")
	r.Handle("/api/followers", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.GetFollowers))).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/followers/{id}", followerHandler.DeleteFollower).Methods("DELETE")
	r.HandleFunc("/api/followers/check", followerHandler.CheckIfFollowing).Methods("GET")

}
