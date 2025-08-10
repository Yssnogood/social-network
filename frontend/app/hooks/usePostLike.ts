'use client';

import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

interface PostReaction {
  liked: boolean;
  disliked: boolean;
  likeCount: number;
  dislikeCount: number;
}

interface UsePostLikeProps {
  postId: number;
  initialLiked?: boolean;
  initialDisliked?: boolean;
  initialLikeCount?: number;
  initialDislikeCount?: number;
}

export function usePostLike({
  postId,
  initialLiked = false,
  initialDisliked = false,
  initialLikeCount = 0,
  initialDislikeCount = 0,
}: UsePostLikeProps) {
  const [reaction, setReaction] = useState<PostReaction>({
    liked: initialLiked,
    disliked: initialDisliked,
    likeCount: initialLikeCount,
    dislikeCount: initialDislikeCount,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setReaction((prev) => {
      const newState = { ...prev };
      
      if (prev.liked) {
        // Toggle off like
        newState.liked = false;
        newState.likeCount = Math.max(0, prev.likeCount - 1);
      } else {
        // Add like (and remove dislike if present)
        newState.liked = true;
        newState.likeCount = prev.likeCount + 1;
        
        if (prev.disliked) {
          newState.disliked = false;
          newState.dislikeCount = Math.max(0, prev.dislikeCount - 1);
        }
      }
      
      return newState;
    });

    try {
      const response = await fetch(`${API_URL}/api/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      
      // Update with server response
      setReaction((prev) => ({
        ...prev,
        likeCount: data.likes || prev.likeCount,
        dislikeCount: data.dislikes || prev.dislikeCount,
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      
      // Revert optimistic update on error
      setReaction({
        liked: initialLiked,
        disliked: initialDisliked,
        likeCount: initialLikeCount,
        dislikeCount: initialDislikeCount,
      });
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLoading, initialLiked, initialDisliked, initialLikeCount, initialDislikeCount]);

  const handleDislike = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setReaction((prev) => {
      const newState = { ...prev };
      
      if (prev.disliked) {
        // Toggle off dislike
        newState.disliked = false;
        newState.dislikeCount = Math.max(0, prev.dislikeCount - 1);
      } else {
        // Add dislike (and remove like if present)
        newState.disliked = true;
        newState.dislikeCount = prev.dislikeCount + 1;
        
        if (prev.liked) {
          newState.liked = false;
          newState.likeCount = Math.max(0, prev.likeCount - 1);
        }
      }
      
      return newState;
    });

    try {
      const response = await fetch(`${API_URL}/api/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }

      const data = await response.json();
      
      // Update with server response
      setReaction((prev) => ({
        ...prev,
        likeCount: data.likes || prev.likeCount,
        dislikeCount: data.dislikes || prev.dislikeCount,
      }));
    } catch (error) {
      console.error('Error disliking post:', error);
      
      // Revert optimistic update on error
      setReaction({
        liked: initialLiked,
        disliked: initialDisliked,
        likeCount: initialLikeCount,
        dislikeCount: initialDislikeCount,
      });
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLoading, initialLiked, initialDisliked, initialLikeCount, initialDislikeCount]);

  return {
    liked: reaction.liked,
    disliked: reaction.disliked,
    likeCount: reaction.likeCount,
    dislikeCount: reaction.dislikeCount,
    isLoading,
    handleLike,
    handleDislike,
  };
}