package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
)

func GroupRoutes(r *mux.Router, groupHandler *handlers.GroupHandler) {
	r.Handle("/api/groups", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.CreateGroup))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetGroupsByUserID))).Methods("GET")
	r.Handle("/api/groups/accept-invitation", (http.HandlerFunc(groupHandler.AcceptGroupInvitation))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/decline-invitation", (http.HandlerFunc(groupHandler.DeclineGroupInvitation))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetGroupByID))).Methods("GET", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/members", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetMembersByGroupID))).Methods("GET", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/members", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.AddMember))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/messages", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.CreateGroupMessage))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/messages", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetGroupMessages))).Methods("GET")
	r.Handle("/api/groups/{id:[0-9]+}/posts", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.CreateGroupPost))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/posts", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetPostsByGroupID))).Methods("GET", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/posts/{postID:[0-9]+}/comments", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.CreateGroupComment))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/posts/{postID:[0-9]+}/comments", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.GetCommentsByGroupPostID))).Methods("GET", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/invite/users", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.InviteUsersToGroup))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/invite/groups", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.InviteGroupsToGroup))).Methods("POST", "OPTIONS")
}