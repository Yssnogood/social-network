import { Comment } from "../../services/comment";
import CommentItem from "./CommentItem";
import NotFoundMessage from "./NotFoundMessage";

interface CommentsListProps {
    comments: Comment[];
    currentUserId: number | null;
}

export default function CommentsList({ comments, currentUserId }: CommentsListProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
            {comments.length === 0 ? (
                <NotFoundMessage message="No comments yet. Be the first to comment!" />
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isOwn={ parseInt(comment.userId) === currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
