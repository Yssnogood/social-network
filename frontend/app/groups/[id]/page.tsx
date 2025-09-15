"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import GroupHeader from "../../components/groupComponent/GroupHeader";
import MembersList from "../../components/groupComponent/MembersList";
import UserInvitation from "../../components/groupComponent/UserInvitation";
import MessageInput from "../../components/groupComponent/MessageInput";
import MessagesList from "../../components/groupComponent/MessagesList";
import EventCreator from "../../components/groupComponent/EventCreator";
import EventsList from "../../components/groupComponent/EventsList";
import PostsList from "../../components/groupComponent/PostsList";
import TabNavigation from "../../components/groupComponent/TabNavigation";
import { useGroupData } from "../../hooks/useGroupData";
import { useGroupWebSocket } from "../../hooks/useGroupWebSocket";
import { createNotification } from "../../../services/notifications";
import {
	Group,
	GroupMember,
	Follower,
	GroupMessage,
	GroupPost,
	GroupComment,
	Event,
	User
} from "../../types/group";

export default function GroupPage() {
	const { id } = useParams();
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	// États principaux
	const [group, setGroup] = useState<Group | null>(null);
	const [members, setMembers] = useState<GroupMember[]>([]);
	const [followers, setFollowers] = useState<Follower[]>([]);
	const [error, setError] = useState<string | null>(null);

	// États pour les messages
	const [messages, setMessages] = useState<GroupMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");

	// États pour les posts
	const [posts, setPosts] = useState<GroupPost[]>([]);
	const [showPosts, setShowPosts] = useState(false);
	const [isLoadingPosts, setIsLoadingPosts] = useState(false);

	// États pour les commentaires
	const [commentsByPost, setCommentsByPost] = useState<Record<number, GroupComment[]>>({});
	const [showCommentsForPost, setShowCommentsForPost] = useState<Record<number, boolean>>({});
	const [newCommentByPost, setNewCommentByPost] = useState<Record<number, string>>({});
	const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

	// États pour les événements
	const [events, setEvents] = useState<Event[]>([]);

	// Custom hooks pour les données et WebSocket
	const {
		fetchGroup,
		fetchMembers,
		fetchFollowers,
		fetchMessages,
		fetchPosts,
		fetchEvents,
		fetchComments
	} = useGroupData(id as string, {
		setGroup,
		setMembers,
		setFollowers,
		setMessages,
		setPosts,
		setEvents,
		setCommentsByPost,
		setLoadingComments,
		setIsLoadingPosts,
		setError
	});

	useGroupWebSocket(id as string, setMessages);

	// Récupération de l'utilisateur actuel
	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const res = await fetch("http://localhost:8080/api/users/me", {
					method: "GET",
					credentials: "include",
				});
				if (!res.ok) throw new Error(await res.text());
				const data = await res.json();
				setCurrentUser({ id: data.id, username: data.username });
			} catch (err: any) {
				console.error("Error fetching current user:", err.message);
				setCurrentUser(null);
			}
		};
		fetchCurrentUser();
	}, []);

	// Initialisation
	useEffect(() => {
		if (!id) return;

		const initialize = async () => {
			await fetchGroup();
			await fetchMembers();
			await fetchFollowers();
			await fetchMessages();
			await fetchEvents();
		};

		initialize();
	}, [id]);

	// Actions pour les messages
	const sendMessage = async () => {
		if (!newMessage.trim()) return;

		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ content: newMessage }),
			});
			if (!res.ok) throw new Error(await res.text());
			setNewMessage("");
			if (!currentUser) return;
			try {
				createNotification({
					userId: currentUser?.id,
					type: "group_message",
					content: `Nouveau message dans le groupe "${group?.title}".`,
					referenceId: group?.id,
					referenceType: "group",
				});
			} catch (err: any) {
				alert(`Erreur lors de la création de la notification : ${err.message}`);
			}
		} catch (err: any) {
			console.error("Error send message:", err.message);
		}
	};

	// Actions pour les invitations
	const inviteUser = async (userIdToInvite: number) => {
		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/members`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ user_id: userIdToInvite, current_user_id: currentUser?.id, current_user_name: currentUser?.username }),
			});
			if (!res.ok) throw new Error(await res.text());
			alert(`Invitation envoyée à l'utilisateur #${userIdToInvite} !`);
			try {
				createNotification({
					userId: userIdToInvite,
					type: "group_invitation",
					content: `Vous avez été invité à rejoindre le groupe "${group?.title}" par ${currentUser?.username}.`,
					referenceId: group?.id,
					referenceType: "group",
				});
			} catch (err: any) {
				alert(`Erreur lors de la création de la notification : ${err.message}`);
			}
		} catch (err: any) {
			alert(`Erreur lors de l'invitation : ${err.message}`);
		}
	};

	// Actions pour les posts
	const createPost = async (content: string) => {
		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/posts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ content }),
			});
			if (!res.ok) throw new Error(await res.text());
			if (!currentUser) return;
			try {
				createNotification({
					userId: currentUser?.id,
					type: "group_post",
					content: `Nouveau post dans le groupe "${group?.title}".`,
					referenceId: group?.id,
					referenceType: "group",
				});
			} catch (err: any) {
				alert(`Erreur lors de la création de la notification : ${err.message}`);
			}
			await fetchPosts();
		} catch (err: any) {
			console.error("Error creating post:", err.message);
			alert(`Erreur lors de la création du post : ${err.message}`);
		}
	};

	const togglePosts = async () => {
		if (!showPosts) {
			await fetchPosts();
		}
		setShowPosts(!showPosts);
	};

	// Actions pour les commentaires
	const toggleComments = async (postId: number) => {
		const isCurrentlyShowing = showCommentsForPost[postId];

		if (!isCurrentlyShowing) {
			if (!commentsByPost[postId]) {
				await fetchComments(postId);
			}
			setShowCommentsForPost((prev) => ({ ...prev, [postId]: true }));
		} else {
			setShowCommentsForPost((prev) => ({ ...prev, [postId]: false }));
		}
	};

	const createComment = async (postId: number, userId: number, username: string) => {
		const commentContent = newCommentByPost[postId];
		if (!commentContent?.trim()) return;

		try {
			const res = await fetch(
				`http://localhost:8080/api/groups/${id}/posts/${postId}/comments`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ content: commentContent }),
				}
			);
			if (!res.ok) throw new Error(await res.text());
			if (!currentUser) return;
			console.log("userId", userId);
			try {
				createNotification({
					userId: userId,
					type: "group_comment",
					content: `${username} a commenté un de vos posts dans le groupe "${group?.title}".`,
					referenceId: group?.id,
					referenceType: "group",
				});
			} catch (err: any) {
				alert(`Erreur lors de la création de la notification : ${err.message}`);
			}

			setNewCommentByPost((prev) => ({ ...prev, [postId]: "" }));
			await fetchComments(postId);
			setPosts((prev) =>
				prev.map((post) =>
					post.id === postId
						? { ...post, comments_count: post.comments_count + 1 }
						: post
				)
			);
		} catch (err: any) {
			console.error("Error creating comment:", err.message);
			alert(`Erreur lors de la création du commentaire : ${err.message}`);
		}
	};

	const handleCommentChange = (postId: number, value: string) => {
		setNewCommentByPost((prev) => ({ ...prev, [postId]: value }));
	};

	// Actions pour les événements
	const createEvent = async (eventData: { title: string; description: string; event_date: string }) => {
		try {
			const formattedEvent = {
				...eventData,
				event_date: new Date(eventData.event_date).toISOString()
			};

			const res = await fetch(`http://localhost:8080/api/groups/${id}/events`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(formattedEvent),
			});

			if (!res.ok) throw new Error(await res.text());
			if (!currentUser) return;
			try {
				createNotification({
					userId: currentUser?.id,
					type: "group_event",
					content: `Nouveau événement dans le groupe "${group?.title}".`,
					referenceId: group?.id,
					referenceType: "group",
				});
			} catch (err: any) {
				alert(`Erreur lors de la création de la notification : ${err.message}`);
			}
			await fetchEvents();
		} catch (err: any) {
			console.error("Erreur création événement:", err.message);
			alert(`Erreur lors de la création de l'événement : ${err.message}`);
		}
	};

	const handleEventResponse = async (eventId: number, status: string) => {
		try {
			const res = await fetch(`http://localhost:8080/api/events/${eventId}/response`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ status }),
			});
			if (!res.ok) throw new Error(await res.text());

			const updatedEvents = events.map((event) =>
				event.id === eventId ? { ...event, status } : event
			);
			setEvents(updatedEvents);
		} catch (err: any) {
			console.error("Error setting event response:", err.message);
			alert(`Erreur lors de la response à l'événement : ${err.message}`);
		}
	};

	const deleteEvent = async (eventId: number) => {
		try {
			const res = await fetch(`http://localhost:8080/api/events/${eventId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());

			setEvents((prev) => prev.filter((event) => event.id !== eventId));
			console.log("Événement supprimé avec succès !");
		} catch (err: any) {
			console.error("Error deleting event:", err.message);
			alert(`Erreur lors de la suppression de l'événement : ${err.message}`);
		}
	};

	// Rendu conditionnel pour les erreurs et le loading
	if (error) return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8">
				<p className="text-red-500">Error: {error}</p>
			</div>
		</AppLayout>
	);
	
	if (!group) return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				</div>
			</div>
		</AppLayout>
	);

	return (
		<AppLayout>
			<div className="container mx-auto px-4 py-6">
				<div className="max-w-4xl mx-auto">
					<GroupHeader group={group} />
					
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							<TabNavigation showPosts={showPosts} onTogglePosts={togglePosts} />

							{!showPosts && (
								<>
									<MessageInput
										value={newMessage}
										onChange={setNewMessage}
										onSend={sendMessage}
									/>
									<MessagesList messages={messages} />
								</>
							)}

							{showPosts && (
								<PostsList
									posts={posts}
									isLoading={isLoadingPosts}
									commentsByPost={commentsByPost}
									showCommentsForPost={showCommentsForPost}
									newCommentByPost={newCommentByPost}
									loadingComments={loadingComments}
									onCreatePost={createPost}
									onToggleComments={toggleComments}
									onCommentChange={handleCommentChange}
									onCreateComment={createComment}
								/>
							)}
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							<MembersList members={members} />
							<UserInvitation followers={followers} onInvite={inviteUser} />
							<EventCreator onCreateEvent={createEvent} />
							<EventsList
								events={events}
								currentUser={currentUser}
								onEventResponse={handleEventResponse}
								onDeleteEvent={deleteEvent}
							/>
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}