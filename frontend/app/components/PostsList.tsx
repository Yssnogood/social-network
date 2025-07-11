import { Post } from "../../services/post";
import PostItem from "./PostItem";

interface PostsListProps {
    posts: Post[];
    isLoading: boolean;
    jwt: string | undefined;
}

export default function PostsList({ posts, isLoading, jwt }: PostsListProps) {
    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                <p className="mt-2 text-gray-400">Loading posts...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-400">No posts yet. Be the first to post!</p>
            </div>
        );
    }

    return (
        <div>
            {posts.map((post) => (
                <PostItem key={post.id} post={post} jwt={jwt} />
            ))}
        </div>
    );
} 