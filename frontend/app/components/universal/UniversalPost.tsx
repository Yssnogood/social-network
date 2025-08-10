'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { UniversalPost } from '../../types/universal';
import { Comment } from '@/services/comment';
import { usePostLike } from '../../hooks/usePostLike';
import ProfileHoverCard from '../ProfileHoverCard';
import UniversalCommentForm from './UniversalCommentForm';

interface UniversalPostProps {
  post: UniversalPost;
  displayMode?: 'compact' | 'normal' | 'extended';
  comments?: Comment[] | any[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onToggleComments?: () => Promise<void>;
  onCreateComment?: (content?: string) => Promise<void>;
  currentUser?: any;
}

export default function UniversalPost({
  post,
  displayMode = 'normal',
  comments = [],
  showComments = false,
  isLoadingComments = false,
  onToggleComments,
  onCreateComment,
  currentUser
}: UniversalPostProps) {
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    liked,
    disliked,
    likeCount,
    dislikeCount,
    isLoading: isLikeLoading,
    handleLike,
    handleDislike
  } = usePostLike({
    postId: post.id,
    initialLiked: post.userLiked,
    initialDisliked: post.userDisliked,
    initialLikeCount: post.likesCount,
    initialDislikeCount: post.dislikesCount
  });

  // Formater l'URL de l'image
  const formatImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/uploads/${url}`;
  };

  // Formater la date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Styles adaptatifs selon le mode d'affichage
  const getContainerClass = () => {
    const base = "bg-gray-800/50 border border-gray-700 rounded-lg transition-all";
    if (displayMode === 'compact') return `${base} p-2`;
    if (displayMode === 'extended') return `${base} p-4`;
    return `${base} p-3`;
  };

  const getContentClass = () => {
    if (displayMode === 'compact') return "text-xs text-gray-300 line-clamp-2";
    if (displayMode === 'extended') return "text-base text-gray-300";
    return "text-sm text-gray-300 line-clamp-3";
  };

  return (
    <div className={getContainerClass()}>
      {/* En-tête avec auteur */}
      <div className="flex items-center gap-2 mb-2">
        {/* Avatar et nom avec ProfileHoverCard */}
        {post.userInfo ? (
          <ProfileHoverCard user={post.userInfo} isMobile={isMobile}>
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className={`rounded-full overflow-hidden bg-gray-700 ${
                displayMode === 'compact' ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                {post.userAvatar && (
                  <img
                    src={formatImageUrl(post.userAvatar) || ''}
                    alt={post.userName}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                )}
              </div>
              {/* Nom */}
              <span className={`font-medium text-white hover:underline cursor-pointer ${
                displayMode === 'compact' ? 'text-xs' : 'text-sm'
              }`}>
                {post.userName}
              </span>
            </div>
          </ProfileHoverCard>
        ) : (
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className={`rounded-full overflow-hidden bg-gray-700 ${
              displayMode === 'compact' ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
              {post.userAvatar && (
                <img
                  src={formatImageUrl(post.userAvatar) || ''}
                  alt={post.userName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Nom */}
            <Link 
              href={`/profile/${post.userName}`}
              className={`font-medium text-white hover:underline ${
                displayMode === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {post.userName}
            </Link>
          </div>
        )}

        {/* Date */}
        <span className={`text-gray-500 ${
          displayMode === 'compact' ? 'text-xs' : 'text-xs'
        }`}>
          {formatDate(post.createdAt)}
        </span>

        {/* Badge de confidentialité pour les posts du feed */}
        {post.context === 'feed' && post.privacy !== undefined && displayMode !== 'compact' && (
          <div className="text-xs text-gray-500">
            {post.privacy === 0 && '🌍'}
            {post.privacy === 1 && '👥'}
            {post.privacy === 2 && '🔒'}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={getContentClass()}>
        {post.content}
      </div>

      {/* Image */}
      {post.imageUrl && !imageError && displayMode !== 'compact' && (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img
            src={formatImageUrl(post.imageUrl) || ''}
            alt="Post image"
            className={`w-full object-cover ${
              displayMode === 'extended' ? 'max-h-96' : 'max-h-48'
            }`}
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-3 mt-2 pt-2 border-t border-gray-700/50 ${
        displayMode === 'compact' ? 'text-xs' : 'text-sm'
      }`}>
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex items-center gap-1 transition-colors ${
            liked 
              ? 'text-green-400 hover:text-green-300' 
              : 'text-gray-400 hover:text-gray-300'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>♥</span>
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        {/* Dislike */}
        <button
          onClick={handleDislike}
          disabled={isLikeLoading}
          className={`flex items-center gap-1 transition-colors ${
            disliked 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-gray-400 hover:text-gray-300'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>👎</span>
          {dislikeCount > 0 && <span>{dislikeCount}</span>}
        </button>

        {/* Comments */}
        {onToggleComments ? (
          <button
            onClick={onToggleComments}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <span>💬</span>
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </button>
        ) : (
          <Link
            href={`/post/${post.id}/comments`}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <span>💬</span>
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </Link>
        )}
      </div>

      {/* Section commentaires (pour les posts de groupe avec gestion inline) */}
      {showComments && onToggleComments && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          {isLoadingComments ? (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">Chargement...</span>
            </div>
          ) : (
            <>
              {/* Liste des commentaires */}
              {comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="bg-gray-700/30 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-white">
                          {comment.username || comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(comment.created_at || comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire de nouveau commentaire */}
              {onCreateComment && (
                <UniversalCommentForm
                  postId={post.id}
                  onSubmit={async (_postId, content) => {
                    // Pass content to create comment
                    await onCreateComment(content);
                  }}
                  placeholder="Ajouter un commentaire..."
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}