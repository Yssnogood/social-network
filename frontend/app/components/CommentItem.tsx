import { Comment } from "../../services/comment";
import { formatRelativeTime } from "../../services/utils";

interface CommentItemProps {
    comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                <div>
                    <div className="font-semibold text-white text-sm">{comment.userName}</div>
                    <div className="text-xs text-gray-400">
                        {formatRelativeTime(new Date(comment.createdAt))}
                    </div>
                </div>
            </div>
            <div className="text-gray-300">{comment.content}</div>
            {comment.imageUrl && (
                <div className="mt-2">
                    <img
                        src={comment.imageUrl}
                        alt="Comment image"
                        className="max-h-48 rounded-lg"
                    />
                </div>
            )}
        </div>
    );
} 