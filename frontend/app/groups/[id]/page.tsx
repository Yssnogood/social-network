"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GroupHeader from "../../components/groupComponent/GroupHeader";
import MembersList from "../../components/groupComponent/MembersList";
import ParticipantsTabs from "../../components/ParticipantsTabs";
import UnifiedInvitationSystem from "../../components/unified/UnifiedInvitationSystem";
import MessagesList from "../../components/groupComponent/MessagesList";
import EventCreationModal from "../../components/creation/modals/EventCreationModal";
import EventsList from "../../components/groupComponent/EventsList";
import PostsList from "../../components/groupComponent/PostsList";
import TabNavigation from "../../components/groupComponent/TabNavigation";
import { useGroupData } from "../../hooks/useGroupData";
import { useGroupWebSocket } from "../../hooks/useGroupWebSocket";
import { createNotification } from "../../../services/notifications";
import {
	Group,
	GroupMember,
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
	const [error, setError] = useState<string | null>(null);
	
	// États pour les invitations avec persistance
	const [selectedInviteUserIds, setSelectedInviteUserIds] = useState<number[]>([]);
	const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);

	// États pour les messages
	const [messages, setMessages] = useState<GroupMessage[]>([]);

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
	const [isEventModalOpen, setIsEventModalOpen] = useState(false);

	// Custom hooks pour les données et WebSocket
	const {
		fetchGroup,
		fetchMembers,
		fetchMessages,
		fetchPosts,
		fetchEvents,
		fetchComments
	} = useGroupData(id as string, {
		setGroup,
		setMembers,
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
				const res = await fetch("http://localhost:8090/api/users/me", {
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
			await fetchMessages();
			await fetchEvents();
		};

		initialize();
	}, [id]);

	// Action pour inviter plusieurs utilisateurs (batch)
	const handleInviteUsers = async (userIds: number[]) => {
		if (!group || !currentUser || userIds.length === 0) return;

		try {
			// Inviter chaque utilisateur sélectionné
			const invitationPromises = userIds.map(async (userIdToInvite) => {
				const res = await fetch(`http://localhost:8090/api/groups/${id}/members`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ 
						user_id: userIdToInvite, 
						current_user_id: currentUser.id, 
						current_user_name: currentUser.username 
					}),
				});
				
				if (!res.ok) throw new Error(`Erreur pour l'utilisateur ${userIdToInvite}: ${await res.text()}`);

				// Créer notification pour cet utilisateur
				try {
					await createNotification({
						userId: userIdToInvite,
						type: "group_invitation",
						content: `Vous avez été invité à rejoindre le groupe "${group.title}" par ${currentUser.username}.`,
						referenceId: group.id,
						referenceType: "group",
					});
				} catch (err: any) {
					console.warn(`Erreur notification pour utilisateur ${userIdToInvite}:`, err.message);
				}
				
				return userIdToInvite;
			});

			const results = await Promise.allSettled(invitationPromises);
			const successful = results.filter(r => r.status === 'fulfilled').length;
			const failed = results.filter(r => r.status === 'rejected');

			if (successful > 0) {
				alert(`${successful} invitation${successful > 1 ? 's' : ''} envoyée${successful > 1 ? 's' : ''} avec succès !`);
				
				// ✅ CORRECTION CRITIQUE: Mettre à jour l'état persistant des invités
				const successfulUserIds = results
					.map((r, index) => r.status === 'fulfilled' ? userIds[index] : null)
					.filter(id => id !== null) as number[];
				setInvitedUserIds(prev => [...prev, ...successfulUserIds]);
			}

			if (failed.length > 0) {
				const failedReasons = failed.map((f: any) => f.reason?.message || 'Erreur inconnue').join(', ');
				alert(`${failed.length} invitation${failed.length > 1 ? 's' : ''} a échoué : ${failedReasons}`);
			}

		} catch (err: any) {
			console.error('Error inviting users:', err);
			alert(`Erreur lors des invitations : ${err.message}`);
		}
	};

	// Actions pour les posts
	const createPost = async (content: string) => {
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${id}/posts`, {
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
				`http://localhost:8090/api/groups/${id}/posts/${postId}/comments`,
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
	const handleEventSuccess = async (eventId: number) => {
		console.log('Event created with ID:', eventId);
		await fetchEvents(); // Recharger la liste des événements
		setIsEventModalOpen(false); // Fermer la modal
	};

	const handleEventResponse = async (eventId: number, status: string) => {
		try {
			const res = await fetch(`http://localhost:8090/api/events/${eventId}/response`, {
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
			const res = await fetch(`http://localhost:8090/api/events/${eventId}`, {
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
	if (error) return <p className="text-red-500">Error: {error}</p>;
	if (!group) return <p>Loading group...</p>;

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl shadow bg-white">
			<GroupHeader group={group} />
			
			{/* ✅ NOUVEAU: Système d'onglets pour membres avec "Invités en attente" */}
			<div className="mb-6">
				<ParticipantsTabs 
					mode="group"
					members={members}
				/>
			</div>
			
			{/* Système d'invitation unifié avec checkboxes persistantes */}
			<div className="mt-6">
				<UnifiedInvitationSystem
					mode="group"
					selectedUserIds={selectedInviteUserIds}
					onSelectionChange={setSelectedInviteUserIds}
					invitedUserIds={invitedUserIds}
					onInvitedUsersChange={setInvitedUserIds}
					onInviteUsers={handleInviteUsers}
					title="Inviter des membres au groupe"
					description="Sélectionnez les utilisateurs que vous souhaitez inviter à rejoindre ce groupe"
					showSearchBar={true}
					showInviteButton={true}
					className="bg-gray-800 border-gray-700"
				/>
			</div>

			{/* Bouton pour créer un événement */}
			<div className="mb-4">
				<button
					onClick={() => setIsEventModalOpen(true)}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
				>
					Créer un Événement
				</button>
			</div>

			<EventsList
				events={events}
				currentUser={currentUser}
				onEventResponse={handleEventResponse}
				onDeleteEvent={deleteEvent}
			/>

			{/* Modal de création d'événement */}
			<EventCreationModal
				isOpen={isEventModalOpen}
				onClose={() => setIsEventModalOpen(false)}
				onSuccess={handleEventSuccess}
				parentGroup={group}
			/>

			<TabNavigation showPosts={showPosts} onTogglePosts={togglePosts} />

			{!showPosts && (
				<MessagesList 
					messages={messages} 
					onSendMessage={async (content: string) => {
						// Utiliser la même logique que sendMessage mais adaptée
						if (!content.trim()) return;
						
						try {
							const res = await fetch(`http://localhost:8090/api/groups/${id}/messages`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								credentials: "include",
								body: JSON.stringify({ content }),
							});
							
							if (!res.ok) throw new Error(await res.text());
							// Le message sera ajouté via WebSocket
						} catch (err: any) {
							console.error("Error sending group message:", err.message);
							throw err;
						}
					}}
					isLoading={false}
				/>
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
	);
}