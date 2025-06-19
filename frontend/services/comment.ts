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
        const resp = await fetch(`${url}/comments/${postId}`, {
            method: "POST",
            body: JSON.stringify({
                jwt: jwt,
                post_id: postId
            })
        });

        if (resp.ok) {
            const commentsData = await resp.json();
            if (!commentsData) {
                return comments
            }
            
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

export async function getCommentsByUserID(userID: number): Promise<Comment[]> {
    let comments: Comment[] = [];

    try {
        const resp = await fetch(`${url}/comments_user`, {
            method: "POST",
            body: JSON.stringify({
                user_id: userID
            })
        });

        if (resp.ok) {
            const commentsData = await resp.json();

            console.log(commentsData)

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
        content: string;
        imageUrl?: string;
    },
    jwt?: string
): Promise<Comment> {
    let newComment: Comment = {
        id: 0,
        postId: commentData.postId,
        userId: "",
        userName: "",
        content: commentData.content,
        imageUrl: commentData.imageUrl,
        createdAt: new Date()
    };

    try {
        const resp = await fetch(`${url}/comments`, {
            method: "POST",
            body: JSON.stringify({
                jwt: jwt,
                post_id: commentData.postId,
                content: commentData.content,
                image_path: commentData.imageUrl
            })
        });

        if (resp.ok) {
            const r = await resp.json();
            newComment = {
                id: r.comment.id,
                postId: r.comment.post_id,
                userId: r.comment.user_id,
                userName: r.username || "User",
                content: r.comment.content,
                imageUrl: r.comment.image_path,
                createdAt: new Date(Date.parse(r.comment.created_at))
            };
        }
    } catch (error) {
        console.error("Failed to create comment:", error);
    }

    return newComment;
}
