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
	r.HandleFunc("/api/followers/check", followerHandler.CheckIfFollowing).Methods("POST")
	r.HandleFunc("/api/followersDetails", followerHandler.GetFollowersHandler).Methods("GET")
	r.HandleFunc("/api/followers/accept", followerHandler.AcceptFollower).Methods("POST")
	r.HandleFunc("/api/followers/decline", followerHandler.DeclineFollower).Methods("POST")
    r.HandleFunc("/api/followingDetails", followerHandler.GetFollowingHandler).Methods("GET")

	r.HandleFunc("/api/friendsDetails", followerHandler.GetFriendsHandler).Methods("GET")

}
