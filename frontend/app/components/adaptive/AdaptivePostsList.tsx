'use client';

import React, { useState } from 'react';
import { GroupPost, GroupComment } from '../../types/group';
import AdaptivePostCard from './AdaptivePostCard';
import PostCreator from '../groupComponent/PostCreator';

interface AdaptivePostsListProps {
  posts: GroupPost[];
  isLoading: boolean;
  drawerPercentage: number;
  commentsByPost: Record<number, GroupComment[]>;
  showCommentsForPost: Record<number, boolean>;
  newCommentByPost: Record<number, string>;
  loadingComments: Record<number, boolean>;
  onCreatePost: (content: string) => Promise<void>;
  onToggleComments: (postId: number) => Promise<void>;
  onCommentChange: (postId: number, value: string) => void;
  onCreateComment: (postId: number, userId: number, username: string) => Promise<void>;
}

export default function AdaptivePostsList({
  posts,
  isLoading,
  drawerPercentage,
  commentsByPost,
  showCommentsForPost,
  newCommentByPost,
  loadingComments,
  onCreatePost,
  onToggleComments,
  onCommentChange,
  onCreateComment,
}: AdaptivePostsListProps) {
  
  // État pour forcer l'affichage du créateur en mode compact
  const [showCompactCreator, setShowCompactCreator] = useState(false);
  
  // Déterminer l'espacement selon la taille du tiroir
  const getSpacing = () => {
    if (drawerPercentage <= 30) return 'space-y-1'; // Compact
    if (drawerPercentage >= 60) return 'space-y-4'; // Extended
    return 'space-y-2'; // Normal
  };

  return (
    <div className={`${getSpacing()} h-full flex flex-col overflow-hidden`}>
      {/* Créateur de post - toujours présent, adaptatif selon l'espace */}
      <div className="flex-shrink-0 mb-2">
        {drawerPercentage >= 35 || showCompactCreator ? (
          <PostCreator 
            onCreatePost={async (content) => {
              await onCreatePost(content);
              setShowCompactCreator(false); // Fermer après création
            }}
            compact={drawerPercentage <= 50}
          />
        ) : (
          // Bouton + compact pour créer un post
          <div className="flex justify-center">
            <button 
              onClick={() => setShowCompactCreator(true)}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
              title="Créer un post"
              aria-label="Créer un nouveau post"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Section titre - adaptatif */}
      {drawerPercentage >= 25 && (
        <div className="flex-shrink-0">
          <h3 className={`font-semibold text-gray-200 ${
            drawerPercentage <= 30 ? 'text-sm' : 
            drawerPercentage >= 60 ? 'text-lg' : 'text-base'
          }`}>
            Posts {drawerPercentage >= 45 && 'du groupe'}
            {drawerPercentage <= 40 && posts && posts.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                {posts.length}
              </span>
            )}
          </h3>
        </div>
      )}

      {/* Loading state adaptatif */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {drawerPercentage >= 40 ? (
              <>
                <div className="animate-spin text-2xl mb-2">⟳</div>
                <p className="text-gray-400 text-sm">Chargement des posts...</p>
              </>
            ) : (
              <div className="animate-spin text-gray-400">⟳</div>
            )}
          </div>
        </div>
      )}

      {/* Empty state adaptatif */}
      {!isLoading && posts && Array.isArray(posts) && posts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            {drawerPercentage >= 50 ? (
              <>
                <div className="text-4xl mb-4 opacity-50">📝</div>
                <p className="mb-2">Aucun post dans ce groupe pour le moment.</p>
                <p className="text-sm opacity-75">Soyez le premier à publier quelque chose !</p>
              </>
            ) : drawerPercentage >= 30 ? (
              <>
                <div className="text-2xl mb-2 opacity-50">📝</div>
                <p className="text-sm">Aucun post</p>
              </>
            ) : (
              <div className="text-gray-400">Vide</div>
            )}
          </div>
        </div>
      )}

      {/* Liste des posts adaptatifs */}
      {!isLoading && posts && Array.isArray(posts) && posts.length > 0 && (
        <div className={`flex-1 overflow-y-auto ${getSpacing()}`}>
          {posts.map((post) => (
            <AdaptivePostCard
              key={post.id}
              post={post}
              drawerPercentage={drawerPercentage}
              comments={commentsByPost[post.id] || []}
              showComments={showCommentsForPost[post.id] || false}
              newComment={newCommentByPost[post.id] || ''}
              isLoadingComments={loadingComments[post.id] || false}
              onToggleComments={() => onToggleComments(post.id)}
              onCommentChange={(value) => onCommentChange(post.id, value)}
              onCreateComment={() => onCreateComment(post.id, post.user_id || 0, post.username || 'Utilisateur')}
            />
          ))}
        </div>
      )}

      {/* Indicateur de scroll (état étendu uniquement) */}
      {!isLoading && posts && posts.length > 3 && drawerPercentage >= 60 && (
        <div className="flex-shrink-0 text-center py-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            {posts.length} post{posts.length > 1 ? 's' : ''} • Scrollez pour voir plus
          </p>
        </div>
      )}
    </div>
  );
}