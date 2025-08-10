const url = "http://localhost:8090/api";

export interface Comment {
    id: number;
    postId: number;
    userId: string;
    userName: string;
    content: string;
    imageUrl?: string;
    createdAt: Date;
    author:any;
}

export async function getComments(postId: number, jwt?: string): Promise<Comment[]> {
    let comments: Comment[] = [];

    try {
        const resp = await fetch(`${url}/comments/${postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
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
                userName: comment.author.username || "User",
                author: comment.author,
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

            comments = commentsData ? commentsData.map((comment: any) => ({
                id: comment.id,
                postId: comment.post_id,
                userId: comment.user_id,
                userName: comment.username || "User",
                author: comment.author,
                content: comment.content,
                imageUrl: comment.image_path,
                createdAt: new Date(Date.parse(comment.created_at))
            })) : [];
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
        createdAt: new Date(),
        author:""
    };

    try {
        console.log('Creating comment with data:', {
            post_id: commentData.postId,
            content: commentData.content,
            image_path: commentData.imageUrl
        });
        
        const resp = await fetch(`${url}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                post_id: commentData.postId,
                content: commentData.content,
                image_path: commentData.imageUrl
            })
        });

        if (resp.ok) {
            const r = await resp.json();
            console.log('Comment API response:', r);
            
            // Handle both formats: direct comment object or wrapped in {comment: ...}
            const commentData = r.comment || r;
            
            newComment = {
                id: commentData.id,
                postId: commentData.post_id,
                userId: commentData.user_id,
                userName: r.username || commentData.username || "User",
                content: commentData.content,
                imageUrl: commentData.image_path,
                createdAt: new Date(Date.parse(commentData.created_at)),
                author: commentData.author || ""
            };
        } else {
            console.error('Comment API error:', resp.status, resp.statusText);
            console.error('Response headers:', Object.fromEntries(resp.headers.entries()));
            const responseText = await resp.text();
            console.error('Response body:', responseText);
        }
    } catch (error) {
        console.error("Failed to create comment:", error);
    }

    return newComment;
}
