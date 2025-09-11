import { Post } from "../../services/post";
import PostItem from "./PostItem";
import LoadingSpinner from "./LoadingSpinner";
import NotFoundMessage from "./NotFoundMessage";

interface PostsListProps {
    posts: Post[];
    isLoading: boolean;
    jwt: string | undefined;
    onlineUser: any;
}

export default function PostsList({ posts, isLoading, jwt, onlineUser }: PostsListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner message="Loading posts..." />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <NotFoundMessage message="No posts yet. Be the first to post!" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-4">
            {posts.map((post) => (
                <PostItem key={post.id} post={post} jwt={jwt} onlineUser={onlineUser} />
            ))}
        </div>
    );
} 