import Link from "next/link";
import { Post, LikePost } from "../../services/post";
import { formatRelativeTime } from "../../services/utils";

interface PostItemProps {
    post: Post;
    jwt: string | undefined;
}

export default function PostItem({ post, jwt }: PostItemProps) {
    return (
        <div id={String(post.id)} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                <div>
                    <div className="font-semibold text-white">{post.userName}</div>
                    <div className="text-xs text-gray-400">
                        {formatRelativeTime(post.createdAt)}
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
                <Link
                    href={`/post/${post.id}/comments`}
                    className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {post.comments} Comment{post.comments !== 1 ? 's' : ''}
                </Link>
            </div>
        </div>
    );
} 