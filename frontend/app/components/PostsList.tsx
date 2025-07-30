import { Post } from "../../services/post";
import PostItem from "./PostItem";
import LoadingSpinner from "./LoadingSpinner";
import NotFoundMessage from "./NotFoundMessage";
import { getUserIdFromToken } from "@/services/user";

interface PostsListProps {
    posts: Post[];
    isLoading: boolean;
    jwt: string | undefined;
    onlineUser :any;
}

export default function PostsList({ posts, isLoading, jwt, onlineUser }: PostsListProps) {
    if (isLoading) {
        return <LoadingSpinner message="Loading posts..." />;
    }

    if (posts.length === 0) {
        return <NotFoundMessage message="No posts yet. Be the first to post!" />;
    }

    console.log(onlineUser)

    return (
        <div>
            {posts.map((post) => (
                <PostItem key={post.id} post={post} jwt={jwt} onlineUser={onlineUser} />
            ))}
        </div>
    );
} 