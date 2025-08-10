'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UniversalPost as UniversalPostType, toUniversalPost } from '../../types/universal';
import UniversalPostWithHandlers from './UniversalPostWithHandlers';
import UniversalPostCreator from './UniversalPostCreator';
import LoadingSpinner from '../LoadingSpinner';
import NotFoundMessage from '../NotFoundMessage';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface UniversalPostsListProps {
  posts: any[];
  isLoading: boolean;
  context: 'feed' | 'group';
  onCreatePost: (postData: any) => Promise<void>;
  currentUser?: any;
  showCreator?: boolean;
  drawerPercentage?: number; // Pour l'adaptive des groupes
  // Gestion des commentaires
  commentsByPost?: Record<number, any[]>;
  showCommentsForPost?: Record<number, boolean>;
  newCommentByPost?: Record<number, string>;
  loadingComments?: Record<number, boolean>;
  onToggleComments?: (postId: number) => Promise<void>;
  onCommentChange?: (postId: number, value: string) => void;
  onCreateComment?: (postId: number, userId: number, username: string, content?: string) => Promise<void>;
}

export default function UniversalPostsList({
  posts,
  isLoading,
  context,
  onCreatePost,
  currentUser,
  showCreator = true,
  drawerPercentage = 100,
  commentsByPost = {},
  showCommentsForPost = {},
  newCommentByPost = {},
  loadingComments = {},
  onToggleComments,
  onCommentChange,
  onCreateComment
}: UniversalPostsListProps) {
  const [displayedPosts, setDisplayedPosts] = useState<UniversalPostType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = context === 'feed' ? 10 : 15; // Plus de posts pour les groupes
  
  // État local pour gérer les commentaires si pas fourni en props
  const [localCommentsState, setLocalCommentsState] = useState<{
    commentsByPost: Record<number, any[]>;
    showCommentsForPost: Record<number, boolean>;
    newCommentByPost: Record<number, string>;
    loadingComments: Record<number, boolean>;
  }>({
    commentsByPost: {},
    showCommentsForPost: {},
    newCommentByPost: {},
    loadingComments: {}
  });

  // Handlers locaux pour les commentaires - stabilisés avec useCallback
  const handleToggleComments = useCallback(async (postId: number) => {
    if (onToggleComments) {
      return onToggleComments(postId);
    }
    
    // Gestion locale
    setLocalCommentsState(prev => ({
      ...prev,
      showCommentsForPost: {
        ...prev.showCommentsForPost,
        [postId]: !prev.showCommentsForPost[postId]
      }
    }));
    
    // Si on affiche les commentaires et qu'on ne les a pas encore chargés
    if (!localCommentsState.showCommentsForPost[postId] && !localCommentsState.commentsByPost[postId]) {
      setLocalCommentsState(prev => ({
        ...prev,
        loadingComments: { ...prev.loadingComments, [postId]: true }
      }));
      
      try {
        // Charger les commentaires depuis l'API
        const { getComments } = await import('@/services/comment');
        const comments = await getComments(postId);
        
        setLocalCommentsState(prev => ({
          ...prev,
          commentsByPost: { ...prev.commentsByPost, [postId]: comments },
          loadingComments: { ...prev.loadingComments, [postId]: false }
        }));
      } catch (error) {
        console.error('Error loading comments:', error);
        setLocalCommentsState(prev => ({
          ...prev,
          loadingComments: { ...prev.loadingComments, [postId]: false }
        }));
      }
    }
  }, [onToggleComments, localCommentsState.showCommentsForPost, localCommentsState.commentsByPost]);

  const handleCommentChange = useCallback((postId: number, value: string) => {
    if (onCommentChange) {
      return onCommentChange(postId, value);
    }
    
    setLocalCommentsState(prev => ({
      ...prev,
      newCommentByPost: { ...prev.newCommentByPost, [postId]: value }
    }));
  }, [onCommentChange]);

  const handleCreateComment = useCallback(async (postId: number, userId: number, username: string, content?: string) => {
    if (onCreateComment) {
      return onCreateComment(postId, userId, username, content);
    }
    
    // Use provided content or fallback to state
    const commentContent = content || localCommentsState.newCommentByPost[postId];
    if (!commentContent?.trim()) return;
    
    try {
      console.log('Creating comment for post', postId, 'with content:', commentContent.trim());
      const { createComment } = await import('@/services/comment');
      const newComment = await createComment({
        postId,
        content: commentContent.trim()
      });
      console.log('Comment created successfully:', newComment);
      
      // Optimistic update - clear input and add comment immediately
      setLocalCommentsState(prev => ({
        ...prev,
        newCommentByPost: { ...prev.newCommentByPost, [postId]: '' },
        commentsByPost: {
          ...prev.commentsByPost,
          [postId]: [...(prev.commentsByPost[postId] || []), newComment]
        }
      }));
      
      // Refresh comments in background for consistency
      try {
        const { getComments } = await import('@/services/comment');
        const updatedComments = await getComments(postId);
        setLocalCommentsState(prev => ({
          ...prev,
          commentsByPost: { ...prev.commentsByPost, [postId]: updatedComments }
        }));
      } catch (refreshError) {
        console.warn('Could not refresh comments:', refreshError);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }, [onCreateComment, localCommentsState.newCommentByPost]);

  // Données finales des commentaires (props ou état local)
  const finalCommentsByPost = Object.keys(commentsByPost).length > 0 ? commentsByPost : localCommentsState.commentsByPost;
  const finalShowCommentsForPost = Object.keys(showCommentsForPost).length > 0 ? showCommentsForPost : localCommentsState.showCommentsForPost;
  const finalNewCommentByPost = Object.keys(newCommentByPost).length > 0 ? newCommentByPost : localCommentsState.newCommentByPost;
  const finalLoadingComments = Object.keys(loadingComments).length > 0 ? loadingComments : localCommentsState.loadingComments;

  // Convertir les posts au format universel avec useMemo pour éviter la boucle
  const universalPosts = React.useMemo(() => 
    posts ? posts.map(post => toUniversalPost(post, context)) : [], 
    [posts, context]
  );

  // Initialiser les posts affichés
  useEffect(() => {
    if (universalPosts.length > 0) {
      const initialPosts = universalPosts.slice(0, ITEMS_PER_PAGE);
      setDisplayedPosts(initialPosts);
      setHasMore(universalPosts.length > ITEMS_PER_PAGE);
    } else {
      setDisplayedPosts([]);
      setHasMore(false);
    }
  }, [universalPosts, ITEMS_PER_PAGE]);

  // Fonction pour charger plus de posts
  const loadMorePosts = () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    const startIndex = displayedPosts.length;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newPosts = universalPosts.slice(startIndex, endIndex);
    
    if (newPosts.length > 0) {
      setDisplayedPosts(prev => [...prev, ...newPosts]);
      setHasMore(endIndex < universalPosts.length);
    } else {
      setHasMore(false);
    }
    
    setIsLoadingMore(false);
  };

  // Hook pour le scroll infini
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

  // Mode d'affichage en fonction du contexte et du drawerPercentage
  const getDisplayMode = (): 'compact' | 'normal' | 'extended' => {
    if (context === 'group') {
      if (drawerPercentage <= 30) return 'compact';
      if (drawerPercentage >= 60) return 'extended';
      return 'normal';
    }
    return 'normal'; // Feed principal toujours normal
  };

  // Espacement adaptatif
  const getSpacing = () => {
    if (context === 'group') {
      if (drawerPercentage <= 30) return 'space-y-1';
      if (drawerPercentage >= 60) return 'space-y-4';
      return 'space-y-2';
    }
    return 'space-y-3'; // Feed principal
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des posts..." />;
  }

  return (
    <div className={`${getSpacing()} h-full flex flex-col`}>
      {/* Créateur de post */}
      {showCreator && (
        <div className="flex-shrink-0 mb-3">
          <UniversalPostCreator
            onCreatePost={onCreatePost}
            context={context}
            compact={context === 'group' && drawerPercentage <= 50}
          />
        </div>
      )}

      {/* Titre pour les groupes */}
      {context === 'group' && drawerPercentage >= 25 && (
        <div className="flex-shrink-0 mb-2">
          <h3 className={`font-semibold text-gray-200 ${
            drawerPercentage <= 30 ? 'text-sm' : 
            drawerPercentage >= 60 ? 'text-lg' : 'text-base'
          }`}>
            Posts {drawerPercentage >= 45 && 'du groupe'}
            {drawerPercentage <= 40 && universalPosts.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                {universalPosts.length}
              </span>
            )}
          </h3>
        </div>
      )}

      {/* Empty state */}
      {universalPosts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <NotFoundMessage 
            message={
              context === 'feed' 
                ? "Aucun post pour le moment. Créez le premier !" 
                : "Aucun post dans ce groupe. Soyez le premier à publier !"
            } 
          />
        </div>
      )}

      {/* Liste des posts */}
      {universalPosts.length > 0 && (
        <div className={`flex-1 overflow-y-auto ${getSpacing()}`}>
          {displayedPosts.map((post) => (
            <UniversalPostWithHandlers
              key={post.id}
              post={post}
              displayMode={getDisplayMode()}
              currentUser={currentUser}
              comments={finalCommentsByPost[post.id] || []}
              showComments={finalShowCommentsForPost[post.id] || false}
              isLoadingComments={finalLoadingComments[post.id] || false}
              onToggleComments={handleToggleComments}
              onCommentChange={handleCommentChange}
              onCreateComment={handleCreateComment}
            />
          ))}
          
          {/* Infinite scroll trigger */}
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
                  {isLoadingMore ? 'Chargement...' : 'Scroll pour plus'} ({displayedPosts.length}/{universalPosts.length})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicateur de scroll (groupe étendu) */}
      {context === 'group' && universalPosts.length > 3 && drawerPercentage >= 60 && (
        <div className="flex-shrink-0 text-center py-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            {universalPosts.length} post{universalPosts.length > 1 ? 's' : ''} • Scrollez pour voir plus
          </p>
        </div>
      )}
    </div>
  );
}