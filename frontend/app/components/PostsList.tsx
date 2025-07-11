import { Post } from "../../services/post";
import PostItem from "./PostItem";
import LoadingSpinner from "./LoadingSpinner";
import NotFoundMessage from "./NotFoundMessage";

interface PostsListProps {
    posts: Post[];
    isLoading: boolean;
    jwt: string | undefined;
}

export default function PostsList({ posts, isLoading, jwt }: PostsListProps) {
    if (isLoading) {
        return <LoadingSpinner message="Loading posts..." />;
    }

    if (posts.length === 0) {
        return <NotFoundMessage message="No posts yet. Be the first to post!" />;
    }

    return (
        <div>
            {posts.map((post) => (
                <PostItem key={post.id} post={post} jwt={jwt} />
            ))}
        </div>
    );
} 