export type Group = {
	id: number;
	creatorId: number;
	creatorName: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
};

export type GroupMember = {
	id: number;
	groupId: number;
	userId: number;
	username: string;
	accepted: boolean;
	createdAt: string;
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

export type User = {
	id: number;
	username: string;
};
