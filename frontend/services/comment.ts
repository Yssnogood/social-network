const url = "http://localhost:8080/api";

export interface Comment {
    id: number;
    postId: number;
    userId: string;
    userName: string;
    content: string;
    imageUrl?: string;
    createdAt: Date;
}

export async function getComments(postId: number, jwt?: string): Promise<Comment[]> {
    let comments: Comment[] = [];

    try {
        const resp = await fetch(`${url}/comments`, {
            method: "POST",
            body: JSON.stringify({
                jwt: jwt,
                post_id: postId
            })
        });

        if (resp.ok) {
            const commentsData = await resp.json();

            comments = commentsData.map((comment: any) => ({
                id: comment.id,
                postId: comment.post_id,
                userId: comment.user_id,
                userName: comment.username || "User",
                content: comment.content,
                imageUrl: comment.image_path,
                createdAt: new Date(Date.parse(comment.created_at))
            }));
        }
    } catch (error) {
        console.error("Failed to fetch comments:", error);
    }

    return comments;
}

export async function createComment(
    commentData: {
        postId: number;
        userId: number;
        content: string;
        imageUrl?: string;
    },
    jwt?: string
): Promise<Comment | null> {
    try {
        const resp = await fetch(`${url}/comment`, {
            method: "POST",
            body: JSON.stringify({
                jwt: jwt,
                post_id: commentData.postId,
                user_id: commentData.userId,
                content: commentData.content
            })
        });

        if (resp.ok) {
            const data = await resp.json();

            return {
                id: data.id || Date.now(),
                postId: commentData.postId,
                userId: data.user_id || "",
                userName: data.username || "User",
                content: commentData.content,
                imageUrl: commentData.imageUrl,
                createdAt: new Date()
            };
        }
    } catch (error) {
        console.error("Failed to create comment:", error);
    }

    return null;
}
