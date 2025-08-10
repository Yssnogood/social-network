'use client';

import React, { useCallback } from 'react';
import UniversalPostComponent from './UniversalPost';
import type { UniversalPost } from '../../types/universal';

interface UniversalPostWithHandlersProps {
  post: UniversalPost;
  displayMode?: 'compact' | 'normal' | 'extended';
  currentUser?: any;
  comments?: any[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onToggleComments: (postId: number) => Promise<void>;
  onCommentChange: (postId: number, value: string) => void;
  onCreateComment: (postId: number, userId: number, username: string, content?: string) => Promise<void>;
}

const UniversalPostWithHandlers = React.memo(function UniversalPostWithHandlers({
  post,
  displayMode,
  currentUser,
  comments,
  showComments,
  isLoadingComments,
  onToggleComments,
  onCommentChange,
  onCreateComment
}: UniversalPostWithHandlersProps) {
  // Créer des handlers stables pour ce post spécifique
  const handleToggleComments = useCallback(() => {
    return onToggleComments(post.id);
  }, [onToggleComments, post.id]);

  const handleCommentChange = useCallback((value: string) => {
    return onCommentChange(post.id, value);
  }, [onCommentChange, post.id]);

  const handleCreateComment = useCallback((content?: string) => {
    // Pass content to the parent handler
    return onCreateComment(post.id, currentUser?.id || 0, currentUser?.username || 'User', content);
  }, [onCreateComment, post.id, currentUser?.id, currentUser?.username]);

  return (
    <UniversalPostComponent
      post={post}
      displayMode={displayMode}
      currentUser={currentUser}
      comments={comments}
      showComments={showComments}
      isLoadingComments={isLoadingComments}
      onToggleComments={handleToggleComments}
      onCreateComment={handleCreateComment}
    />
  );
});

export default UniversalPostWithHandlers;