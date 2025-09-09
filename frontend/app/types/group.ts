export type Group = {
	id: number;
	creator_id: number;
	creator_name: string;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
};

export type GroupMember = {
	id: number;
	groupId: number;
	userId: number;
	username: string;
	accepted: boolean;
	created_at: string;
};

export type EventResponse = {
	event_id: number;
	user_id: number;
	username: string;
	status: 'going' | 'not_going' | 'maybe';
	created_at: string;
};

export interface Follower {
	follower_id: number;
	followed_id: number;
	accepted: boolean;
	followed_at: string;
}

export type GroupMessage = {
	id: number;
	group_id: number;
	user_id: number;
	username: string;
	content: string;
	created_at: string;
	updated_at: string;
};

export type GroupPost = {
	id: number;
	group_id: number;
	user_id: number;
	username: string;
	content: string;
	image_path?: string;
	created_at: string;
	updated_at: string;
	comments_count: number;
	likes_count?: number;
	dislikes_count?: number;
	user_liked?: boolean;
	user_disliked?: boolean;
};

export type GroupComment = {
	id: number;
	group_post_id: number;
	user_id: number;
	username: string;
	content: string;
	created_at: string;
	updated_at: string;
};

export type Event = {
	id: number;
	group_id: number;
	creator_id: number;
	title: string;
	description: string;
	event_date: string;
	created_at: string;
	updated_at: string;
};

export interface EventWithResponse extends Event {
	response_status?: "going" | "not_going" | null;
}

export type EventMessage = {
	id: number;
	event_id: number;
	user_id: number;
	username: string;
	content: string;
	created_at: string;
	updated_at: string;
};

// Interface unifiée pour tous les types de messages
export interface UniversalMessage {
	id: number;
	user_id: number;
	username: string;
	content: string;
	created_at: string;
	updated_at: string;
	context_type: 'group' | 'event';
	context_id: number; // group_id pour groupe, event_id pour événement
}

// Type union pour les messages contextuels
export type ContextualMessage = GroupMessage | EventMessage;

// Contexte de discussion pour identifier le type de conversation
export interface DiscussionContext {
	type: 'group' | 'event';
	id: number; // ID du groupe ou de l'événement
	parentId?: number; // ID du groupe parent si c'est un événement
}

export type User = {
	id: number;
	username: string;
	first_name?: string;
	last_name?: string;
	avatar_path?: string;
};
