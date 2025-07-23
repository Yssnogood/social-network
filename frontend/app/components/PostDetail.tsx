import { Post, LikePost } from "../../services/post";
import { formatRelativeTime } from "../../services/utils";

interface PostDetailProps {
    post: Post;
    commentsCount: number;
    jwt: string | undefined;
}

export default function PostDetail({ post, commentsCount, jwt }: PostDetailProps) {
    return (
        <div id={String(post.id)} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3">{post.userName.avatar_path}</div>
                <div>
                    <div className="font-semibold text-white">{post.userName.username}</div>
                    <div className="text-xs text-gray-400">
                        {formatRelativeTime(new Date(post.createdAt))}
                    </div>
                </div>
            </div>
            <div className="mb-3 text-gray-300">
                {post.content}
            </div>
            {post.imageUrl && (
                <div className="mb-3">
                    <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="max-h-96 rounded-lg mx-auto"
                    />
                </div>
            )}
            <div className="border-t border-gray-700 pt-3 mt-3 flex gap-4">
                <button
                    className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1"
                    onClick={() => {
                        LikePost(post.id, jwt);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={"h-5 w-5 like" + (post.liked ? " liked" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span id={`like ${post.id}`}>{post.likes}</span> Like{post.likes !== 1 ? 's' : ''}
                </button>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                    💬 {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );
} 