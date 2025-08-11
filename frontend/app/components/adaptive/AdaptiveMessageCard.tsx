'use client';

import React, { useState } from 'react';
import { ContextualMessage } from '../../types/group';
import { useMessageVignette, getCombinedVignetteClasses, getVignetteStyles } from '../../hooks/useAdaptiveVignette';
import '../../styles/adaptive-vignettes.css';

interface AdaptiveMessageCardProps {
  message: ContextualMessage; // 🎯 Messages contextuels (groupe OU événement)
  drawerPercentage: number;
  currentUserId?: number;
  isConsecutive?: boolean; // Message consécutif du même auteur
  showTimeStamp?: boolean;
}

export default function AdaptiveMessageCard({
  message,
  drawerPercentage,
  currentUserId,
  isConsecutive = false,
  showTimeStamp = true,
}: AdaptiveMessageCardProps) {
  const adaptiveConfig = useMessageVignette(drawerPercentage);
  const [isHovered, setIsHovered] = useState(false);

  // Classes CSS combinées
  const cardClasses = getCombinedVignetteClasses(
    'relative group',
    'message',
    adaptiveConfig
  );

  // Styles dynamiques
  const cardStyles = getVignetteStyles(adaptiveConfig);

  // Déterminer si c'est un message de l'utilisateur actuel
  const isOwnMessage = currentUserId === message.user_id;

  // Formater l'heure selon l'état
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    switch (adaptiveConfig.state) {
      case 'compact':
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      case 'normal':
        return date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      case 'extended':
      default:
        return date.toLocaleString('fr-FR', { 
          day: '2-digit',
          month: '2-digit',
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
        return content.slice(0, 25) + (content.length > 25 ? '...' : '');
      case 'normal':
        return content.slice(0, 150) + (content.length > 150 ? '...' : '');
      case 'extended':
      default:
        return content;
    }
  };

  // Classes conditionnelles pour l'alignement des messages
  const messageAlignment = isOwnMessage ? 'ml-auto' : 'mr-auto';
  const messageColor = isOwnMessage 
    ? 'bg-amber-600/20 border-amber-500/30' 
    : 'bg-gray-700/50 border-gray-600/30';

  return (
    <div 
      className={`${cardClasses} ${messageAlignment} ${messageColor} rounded-lg border max-w-[85%] relative group p-3`}
      style={{
        ...cardStyles,
        marginBottom: isConsecutive ? '0.25rem' : '0.75rem',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Message de ${message.username}`}
    >
      {/* Header du message avec nom et badge (masqué si consécutif en mode compact) */}
      {(!isConsecutive || adaptiveConfig.state !== 'compact') && (
        <div className="flex items-center gap-2 mb-2">
          {/* Avatar (visible selon l'état et si pas consécutif) */}
          {!isConsecutive && adaptiveConfig.state !== 'compact' && (
            <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {message.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          
          {/* Nom avec badge "Vous" si besoin */}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`font-medium text-sm truncate ${
              isOwnMessage ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {adaptiveConfig.state === 'compact' 
                ? (message.username || 'Utilisateur').slice(0, 8) 
                : (message.username || 'Utilisateur')}
            </span>
            
            {isOwnMessage && adaptiveConfig.state !== 'compact' && (
              <span className="bg-amber-600/30 text-amber-300 text-xs px-1.5 py-0.5 rounded">
                Vous
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contenu du message */}
      <div className="text-gray-200 text-sm mb-2">
        {getTruncatedContent(message.content)}
      </div>

      {/* Heure en bas à droite */}
      {showTimeStamp && (
        <div className="flex justify-end">
          <time 
            className="text-xs text-gray-500 opacity-75"
            dateTime={message.created_at}
          >
            {formatTime(message.created_at)}
          </time>
        </div>
      )}

      {/* Actions du message (état étendu uniquement) */}
      {adaptiveConfig.shouldShowSecondaryActions && adaptiveConfig.state === 'extended' && (
        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-400 hover:text-gray-300 text-xs">
            💬 Répondre
          </button>
          <button className="text-gray-400 hover:text-gray-300 text-xs">
            ⭐ Épingler
          </button>
          {isOwnMessage && (
            <>
              <button className="text-gray-400 hover:text-gray-300 text-xs">
                ✏️ Modifier
              </button>
              <button className="text-red-400 hover:text-red-300 text-xs">
                🗑 Supprimer
              </button>
            </>
          )}
        </div>
      )}

      {/* Indicateur de hover (état étendu) */}
      {isHovered && adaptiveConfig.state === 'extended' && (
        <div className="absolute inset-0 border border-amber-400/20 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

/**
 * Composant conteneur pour une liste de messages adaptatifs
 */
interface AdaptiveMessageListProps {
  messages: ContextualMessage[]; // 🎯 Messages contextuels (groupe OU événement)
  drawerPercentage: number;
  currentUserId?: number;
}

export function AdaptiveMessageList({
  messages,
  drawerPercentage,
  currentUserId,
}: AdaptiveMessageListProps) {
  const adaptiveConfig = useMessageVignette(drawerPercentage);

  // Vérification de sécurité pour les messages
  if (!messages || !Array.isArray(messages)) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p className="text-sm">Aucun message disponible</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          {drawerPercentage >= 40 ? (
            <>
              <div className="text-2xl mb-2 opacity-50">💬</div>
              <p className="text-sm">Aucun message dans ce chat</p>
              <p className="text-xs opacity-75 mt-1">Commencez la conversation !</p>
            </>
          ) : (
            <p className="text-sm">Chat vide</p>
          )}
        </div>
      </div>
    );
  }

  // ✅ Trier les messages par date pour avoir les plus récents en bas
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className={`flex flex-col h-full`}>
      {/* ✅ Conteneur scrollable pour les messages - comme dans UniversalPostsList */}
      <div className={`flex-1 overflow-y-auto space-y-${adaptiveConfig.state === 'compact' ? '1' : '3'} pb-2`}>
        {sortedMessages.map((message, index) => {
          const previousMessage = index > 0 ? sortedMessages[index - 1] : null;
          const isConsecutive = previousMessage?.user_id === message.user_id;
          
          // En mode compact, grouper les messages consécutifs plus agressivement
          const shouldShowTimeStamp = adaptiveConfig.state === 'extended' || 
            !isConsecutive || 
            (previousMessage && 
              new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 300000 // 5 minutes
            );

          return (
            <AdaptiveMessageCard
              key={`message-${message.id}-${index}`}
              message={message}
              drawerPercentage={drawerPercentage}
              currentUserId={currentUserId}
              isConsecutive={isConsecutive && adaptiveConfig.state === 'compact'}
              showTimeStamp={shouldShowTimeStamp}
            />
          );
        })}
      </div>
    </div>
  );
}