import {
	Group,
	GroupMember,
	Follower,
	GroupMessage,
	GroupPost,
	GroupComment,
	Event
} from "../types/group";

interface UseGroupDataProps {
	setGroup: (group: Group) => void;
	setMembers: (members: GroupMember[]) => void;
	setFollowers: (followers: Follower[]) => void;
	setMessages: (messages: GroupMessage[]) => void;
	setPosts: (posts: GroupPost[]) => void;
	setEvents: (events: Event[]) => void;
	setCommentsByPost: (comments: Record<number, GroupComment[]> | ((prev: Record<number, GroupComment[]>) => Record<number, GroupComment[]>)) => void;
	setLoadingComments: (loading: Record<number, boolean> | ((prev: Record<number, boolean>) => Record<number, boolean>)) => void;
	setIsLoadingPosts: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useGroupData = (groupId: string, setters: UseGroupDataProps) => {
	const {
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
	} = setters;

	const fetchGroup = async () => {
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${groupId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const raw = await res.json();
			setGroup({
				id: raw.id,
				creatorId: raw.creator_id,
				creatorName: raw.creator_name,
				title: raw.title,
				description: raw.description,
				createdAt: raw.created_at,
				updatedAt: raw.updated_at,
			});
		} catch (err: any) {
			setError(err.message);
		}
	};

	const fetchMembers = async () => {
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${groupId}/members`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const raw = await res.json();
			const mapped = raw.map((m: any) => ({
				id: m.id,
				groupId: m.group_id,
				userId: m.user_id,
				username: m.username,
				accepted: m.accepted,
				createdAt: m.created_at,
			}));
			setMembers(mapped);
		} catch (err: any) {
			console.error("Error fetching members:", err.message);
		}
	};

	const fetchFollowers = async () => {
		try {
			const res = await fetch(`http://localhost:8090/api/followers`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			setFollowers(data);
		} catch (error: any) {
			console.error("Error fetching followers:", error.message);
		}
	};

	const fetchMessages = async () => {
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${groupId}/messages`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			setMessages(data);
		} catch (err: any) {
			console.error("Error messages:", err.message);
		}
	};

	const fetchPosts = async () => {
		setIsLoadingPosts(true);
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${groupId}/posts`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			setPosts(Array.isArray(data) ? data : []);
		} catch (err: any) {
			console.error("Error fetching posts:", err.message);
		} finally {
			setIsLoadingPosts(false);
		}
	};

	const fetchEvents = async () => {
		try {
			const res = await fetch(`http://localhost:8090/api/groups/${groupId}/events`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			setEvents(data || []);
			console.log("Events fetched:", data);
		} catch (err: any) {
			console.error("Erreur lors du chargement des événements:", err.message);
		}
	};

	const fetchComments = async (postId: number) => {
		setLoadingComments((prev) => ({ ...prev, [postId]: true }));
		try {
			const res = await fetch(
				`http://localhost:8090/api/groups/${groupId}/posts/${postId}/comments`,
				{
					credentials: "include",
				}
			);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			setCommentsByPost((prev) => ({
				...prev,
				[postId]: Array.isArray(data) ? data : [],
			}));
		} catch (err: any) {
			console.error("Error fetching comments:", err.message);
		} finally {
			setLoadingComments((prev) => ({ ...prev, [postId]: false }));
		}
	};

	return {
		fetchGroup,
		fetchMembers,
		fetchFollowers,
		fetchMessages,
		fetchPosts,
		fetchEvents,
		fetchComments
	};
};