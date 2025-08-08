'use client';

import React, { useState } from 'react';
import { GroupMessage } from '../../types/group';
import { useMessageVignette, getCombinedVignetteClasses, getVignetteStyles } from '../../hooks/useAdaptiveVignette';
import '../../styles/adaptive-vignettes.css';

interface AdaptiveMessageCardProps {
  message: GroupMessage;
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
  const isOwnMessage = currentUserId === message.sender_id;

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
    <article 
      className={`${cardClasses} ${messageAlignment} max-w-[85%]`}
      style={{
        ...cardStyles,
        marginBottom: isConsecutive ? '0.25rem' : '0.75rem',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Message de ${message.sender_username}`}
    >
      <div className={`${messageColor} rounded-lg border`}>
        {/* Header du message (masqué si consécutif en mode compact) */}
        {(!isConsecutive || adaptiveConfig.state !== 'compact') && (
          <header className="vignette-meta">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Avatar (visible selon l'état et si pas consécutif) */}
                {!isConsecutive && adaptiveConfig.state !== 'compact' && (
                  <div className="vignette-avatar bg-amber-600 text-white flex items-center justify-center font-semibold">
                    {message.sender_username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Informations expéditeur */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`vignette-title font-medium truncate ${
                      isOwnMessage ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {adaptiveConfig.state === 'compact' 
                        ? message.sender_username.slice(0, 8) 
                        : message.sender_username}
                    </h3>
                    
                    {/* Badge "Vous" pour les messages propres */}
                    {isOwnMessage && adaptiveConfig.state !== 'compact' && (
                      <span className="vignette-badge bg-amber-600/30 text-amber-300 text-xs">
                        Vous
                      </span>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  {showTimeStamp && (
                    <time 
                      className="text-xs opacity-60"
                      dateTime={message.created_at}
                    >
                      {formatTime(message.created_at)}
                    </time>
                  )}
                </div>
              </div>

              {/* Indicateur de statut (compact) */}
              {adaptiveConfig.state === 'compact' && isOwnMessage && (
                <div className="vignette-indicator text-amber-400">
                  ✓
                </div>
              )}
            </div>
          </header>
        )}

        {/* Contenu du message */}
        <div className="vignette-content text-gray-200">
          {getTruncatedContent(message.content)}
        </div>

        {/* Actions du message (état étendu uniquement) */}
        {adaptiveConfig.shouldShowSecondaryActions && adaptiveConfig.state === 'extended' && (
          <footer className="vignette-actions opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="secondary-action text-gray-400 hover:text-gray-300 text-xs">
              💬 Répondre
            </button>
            <button className="secondary-action text-gray-400 hover:text-gray-300 text-xs">
              ⭐ Épingler
            </button>
            {isOwnMessage && (
              <>
                <button className="secondary-action text-gray-400 hover:text-gray-300 text-xs">
                  ✏️ Modifier
                </button>
                <button className="secondary-action text-red-400 hover:text-red-300 text-xs">
                  🗑 Supprimer
                </button>
              </>
            )}
          </footer>
        )}
      </div>

      {/* Indicateur de statut du message (état étendu) */}
      {adaptiveConfig.state === 'extended' && isOwnMessage && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="text-amber-400">✓</span>
            Envoyé
          </span>
        </div>
      )}

      {/* Indicateur de hover (état étendu) */}
      {isHovered && adaptiveConfig.state === 'extended' && (
        <div className="absolute inset-0 border border-amber-400/20 rounded-lg pointer-events-none" />
      )}
    </article>
  );
}

/**
 * Composant conteneur pour une liste de messages adaptatifs
 */
interface AdaptiveMessageListProps {
  messages: GroupMessage[];
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

  return (
    <div className={`space-y-${adaptiveConfig.state === 'compact' ? '1' : '3'} flex flex-col h-full overflow-hidden`}>
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const isConsecutive = previousMessage?.sender_id === message.sender_id;
        
        // En mode compact, grouper les messages consécutifs plus agressivement
        const shouldShowTimeStamp = adaptiveConfig.state === 'extended' || 
          !isConsecutive || 
          (previousMessage && 
            new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 300000 // 5 minutes
          );

        return (
          <AdaptiveMessageCard
            key={message.id}
            message={message}
            drawerPercentage={drawerPercentage}
            currentUserId={currentUserId}
            isConsecutive={isConsecutive && adaptiveConfig.state === 'compact'}
            showTimeStamp={shouldShowTimeStamp}
          />
        );
      })}
    </div>
  );
}