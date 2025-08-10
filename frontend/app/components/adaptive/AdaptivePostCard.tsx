'use client';

import React, { useState } from 'react';
import { GroupPost, GroupComment } from '../../types/group';
import { usePostVignette, getCombinedVignetteClasses, getVignetteStyles } from '../../hooks/useAdaptiveVignette';
import { usePostLike } from '../../hooks/usePostLike';
import '../../styles/adaptive-vignettes.css';

interface AdaptivePostCardProps {
  post: GroupPost;
  drawerPercentage: number;
  comments?: GroupComment[];
  showComments?: boolean;
  newComment?: string;
  isLoadingComments?: boolean;
  initialLiked?: boolean;
  initialDisliked?: boolean;
  initialLikeCount?: number;
  initialDislikeCount?: number;
  onToggleComments?: () => Promise<void>;
  onCommentChange?: (value: string) => void;
  onCreateComment?: () => Promise<void>;
}

export default function AdaptivePostCard({
  post,
  drawerPercentage,
  comments = [],
  showComments = false,
  newComment = '',
  isLoadingComments = false,
  initialLiked = false,
  initialDisliked = false,
  initialLikeCount = 0,
  initialDislikeCount = 0,
  onToggleComments,
  onCommentChange,
  onCreateComment,
}: AdaptivePostCardProps) {
  const adaptiveConfig = usePostVignette(drawerPercentage);
  const [isHovered, setIsHovered] = useState(false);
  
  // Hook pour gérer les likes/dislikes
  const {
    liked,
    disliked,
    likeCount,
    dislikeCount,
    isLoading: isLikeLoading,
    handleLike,
    handleDislike,
  } = usePostLike({
    postId: post.id,
    initialLiked,
    initialDisliked,
    initialLikeCount,
    initialDislikeCount,
  });

  // Classes CSS combinées
  const cardClasses = getCombinedVignetteClasses(
    'relative cursor-pointer',
    'post',
    adaptiveConfig
  );

  // Styles dynamiques
  const cardStyles = getVignetteStyles(adaptiveConfig);

  // Obtenir le nom d'utilisateur de manière cohérente
  const getUsername = (): string => {
    return post.author_username || post.username || 'Utilisateur';
  };

  // Formater la date selon l'état
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    switch (adaptiveConfig.state) {
      case 'compact':
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'normal':
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      case 'extended':
      default:
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  // Tronquer le contenu selon l'état
  const getTruncatedContent = (content: string): string => {
    if (!adaptiveConfig.shouldShowContent) return '';
    
    switch (adaptiveConfig.state) {
      case 'compact':
        return content.slice(0, 20) + (content.length > 20 ? '...' : '');
      case 'normal':
        return content.slice(0, 100) + (content.length > 100 ? '...' : '');
      case 'extended':
      default:
        return content;
    }
  };

  return (
    <article 
      className={cardClasses}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Post de ${getUsername()}`}
    >
      {/* Header du post */}
      <header className="vignette-meta">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Avatar (visible selon l'état) */}
            {adaptiveConfig.state !== 'compact' && (
              <div className="vignette-avatar bg-blue-600 text-white flex items-center justify-center font-semibold">
                {getUsername().charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Informations auteur */}
            <div className="min-w-0 flex-1">
              <h3 className="vignette-title text-blue-400 font-medium truncate">
                {getUsername()}
              </h3>
              <time 
                className="text-xs opacity-70"
                dateTime={post.created_at}
              >
                {formatDate(post.created_at)}
              </time>
            </div>
          </div>

          {/* Actions du header (droite) */}
          <div className="flex items-center gap-2">
            {/* Indicateur de commentaires (compact) */}
            {adaptiveConfig.state === 'compact' && post.comments_count > 0 && (
              <div className="vignette-badge bg-blue-600/20 text-blue-400 vignette-indicator">
                {post.comments_count}
              </div>
            )}
            
            {/* Bouton Partager dans le coin */}
            <button 
              className="text-gray-400 hover:text-blue-300 font-medium flex items-center justify-center transition-colors"
              title="Partager ce post"
              aria-label="Partager ce post"
            >
              {adaptiveConfig.state === 'compact' ? (
                <span className="text-sm">↗</span>
              ) : (
                <span className="text-sm">↗</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu du post */}
      {adaptiveConfig.shouldShowContent && (
        <div className="vignette-content text-gray-200 flex-1">
          {getTruncatedContent(post.content)}
        </div>
      )}

      {/* Actions du post - layout optimisé */}
      <footer className="vignette-actions">
        {/* Actions principales (gauche) */}
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={onToggleComments}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            disabled={isLoadingComments}
          >
            {isLoadingComments ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <span>{showComments ? '▼' : '▶'}</span>
            )}
            
            {adaptiveConfig.state !== 'compact' && (
              <span>
                {showComments ? 'Masquer' : 'Voir'} commentaires
                {post.comments_count > 0 && (
                  <span className="vignette-badge bg-blue-600/20 text-blue-400 ml-1">
                    {post.comments_count}
                  </span>
                )}
              </span>
            )}
            
            {adaptiveConfig.state === 'compact' && post.comments_count > 0 && (
              <span>{post.comments_count}</span>
            )}
          </button>

          {/* J'aime / J'aime pas (visible selon l'état) */}
          {adaptiveConfig.shouldShowSecondaryActions && (
            <div className="flex items-center gap-3">
              {/* Bouton J'aime */}
              <button 
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`secondary-action font-medium transition-colors ${
                  liked 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {adaptiveConfig.state === 'compact' ? (
                  <span className="flex items-center gap-1">
                    ♥ {likeCount > 0 && likeCount}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    ♥ J'aime {likeCount > 0 && `(${likeCount})`}
                  </span>
                )}
              </button>

              {/* Bouton J'aime pas */}
              <button 
                onClick={handleDislike}
                disabled={isLikeLoading}
                className={`secondary-action font-medium transition-colors ${
                  disliked 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {adaptiveConfig.state === 'compact' ? (
                  <span className="flex items-center gap-1">
                    ♠ {dislikeCount > 0 && dislikeCount}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    ♠ J'aime pas {dislikeCount > 0 && `(${dislikeCount})`}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

      </footer>

      {/* Section commentaires (étendue) */}
      {showComments && adaptiveConfig.state === 'extended' && (
        <section className="mt-4 pt-4 border-t border-gray-700">
          {/* Liste des commentaires */}
          {comments.length > 0 && (
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {comments.map((comment, index) => (
                <div key={index} className="text-sm bg-gray-800/50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-blue-400 text-xs">
                      {comment.author_username}
                    </span>
                    <time className="text-xs opacity-60">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </time>
                  </div>
                  <p className="text-gray-300 text-xs">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire nouveau commentaire */}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange?.(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-sm resize-none"
              rows={2}
            />
            <button
              onClick={onCreateComment}
              disabled={!newComment.trim()}
              className="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium"
            >
              ➤
            </button>
          </div>
        </section>
      )}

      {/* Indicateur de hover (état étendu) */}
      {isHovered && adaptiveConfig.state === 'extended' && (
        <div className="absolute inset-0 border border-blue-400/30 rounded-lg pointer-events-none" />
      )}
    </article>
  );
}