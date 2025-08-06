import { useState, useEffect } from 'react';
import { Post } from "../../services/post";
import PostItem from "./PostItem";
import LoadingSpinner from "./LoadingSpinner";
import NotFoundMessage from "./NotFoundMessage";
import { getUserIdFromToken } from "@/services/user";
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

interface PostsListProps {
    posts: Post[];
    isLoading: boolean;
    jwt: string | undefined;
    onlineUser :any;
}

export default function PostsList({ posts, isLoading, jwt, onlineUser }: PostsListProps) {
    const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Initialiser les posts affichés avec les 10 premiers
    useEffect(() => {
        if (posts.length > 0) {
            const initialPosts = posts.slice(0, ITEMS_PER_PAGE);
            setDisplayedPosts(initialPosts);
            setHasMore(posts.length > ITEMS_PER_PAGE);
            
            console.log(`[PostsList] INITIAL LOAD:`);
            console.log(`  - Total posts: ${posts.length}`);
            console.log(`  - ITEMS_PER_PAGE: ${ITEMS_PER_PAGE}`);
            console.log(`  - Initial posts to display: ${initialPosts.length}`);
            console.log(`  - HasMore: ${posts.length > ITEMS_PER_PAGE}`);
        }
    }, [posts]);

    // Fonction pour charger plus de posts
    const loadMorePosts = () => {
        if (isLoadingMore) {
            console.log('[PostsList] Already loading more, skipping');
            return; 
        }
        
        console.log(`[PostsList] Starting loadMorePosts - Current: ${displayedPosts.length}, Total: ${posts.length}`);
        setIsLoadingMore(true);
        
        // Utiliser displayedPosts.length au lieu de page
        const startIndex = displayedPosts.length;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newPosts = posts.slice(startIndex, endIndex);
        
        console.log(`[PostsList] LoadMore - Start: ${startIndex}, End: ${endIndex}, New: ${newPosts.length}`);
        
        if (newPosts.length > 0) {
            setDisplayedPosts(prev => {
                const updated = [...prev, ...newPosts];
                console.log(`[PostsList] DisplayedPosts updated: ${updated.length}/${posts.length}`);
                return updated;
            });
            setHasMore(endIndex < posts.length);
        } else {
            console.log('[PostsList] No more posts to load');
            setHasMore(false);
        }
        setIsLoadingMore(false);
    };

    // Utiliser le hook infinite scroll
    const infiniteScrollRef = useInfiniteScroll(
        loadMorePosts,
        hasMore,
        isLoadingMore,
        {
            threshold: 0.1,
            debounceMs: 300,
            rootMargin: '50px'
        }
    );

    if (isLoading) {
        return <LoadingSpinner message="Loading posts..." />;
    }

    if (posts.length === 0) {
        return <NotFoundMessage message="No posts yet. Be the first to post!" />;
    }

    console.log(`[PostsList] RENDERING ${displayedPosts.length} posts out of ${posts.length} total`);

    return (
        <div>
            {displayedPosts.map((post) => (
                <PostItem key={post.id} post={post} jwt={jwt} onlineUser={onlineUser} />
            ))}
            
            {/* Element pour déclencher le chargement de plus de posts */}
            {hasMore && displayedPosts.length > 0 && (
                <div 
                    ref={infiniteScrollRef} 
                    className="h-16 flex items-center justify-center border-t border-gray-700 my-4"
                >
                    <div className="flex items-center justify-center space-x-2">
                        {isLoadingMore && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        )}
                        <span className="text-xs text-gray-400">
                            {isLoadingMore ? 'Chargement...' : 'Scroll pour plus'} ({displayedPosts.length}/{posts.length})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
} 