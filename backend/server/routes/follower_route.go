package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
	"net/http"
	"social-network/backend/server/middlewares"
)

func FollowersRoutes(r *mux.Router, followerHandler *handlers.FollowerHandler) {
	r.Handle("/api/followers", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.CreateFollower))).Methods("POST", "OPTIONS")
	r.Handle("/api/followers", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.GetFollowers))).Methods("GET", "OPTIONS")
	r.Handle("/api/followers/{id}", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.DeleteFollower))).Methods("DELETE", "OPTIONS")
	r.Handle("/api/followers/check", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.CheckIfFollowing))).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/followersDetails", followerHandler.GetFollowersHandler).Methods("GET")
	r.Handle("/api/followers/accept", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.AcceptFollower))).Methods("POST", "OPTIONS")
	r.Handle("/api/followers/decline", middlewares.JWTMiddleware(http.HandlerFunc(followerHandler.DeclineFollower))).Methods("POST", "OPTIONS")

}
