'use client';

import React, { useState } from 'react';
import { Event } from '../../types/group';
import { useEventVignette, getCombinedVignetteClasses, getVignetteStyles } from '../../hooks/useAdaptiveVignette';
import '../../styles/adaptive-vignettes.css';

interface AdaptiveEventCardProps {
  event: Event;
  drawerPercentage: number;
  currentUserId?: number;
  onEventResponse?: (eventId: number, status: string) => Promise<void>;
  onDeleteEvent?: (eventId: number) => Promise<void>;
}

export default function AdaptiveEventCard({
  event,
  drawerPercentage,
  currentUserId,
  onEventResponse,
  onDeleteEvent,
}: AdaptiveEventCardProps) {
  const adaptiveConfig = useEventVignette(drawerPercentage);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Classes CSS combinées
  const cardClasses = getCombinedVignetteClasses(
    'relative cursor-pointer',
    'event',
    adaptiveConfig
  );

  // Styles dynamiques
  const cardStyles = getVignetteStyles(adaptiveConfig);

  // Formater la date selon l'état
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    switch (adaptiveConfig.state) {
      case 'compact':
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'normal':
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'extended':
      default:
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'short',
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  // Tronquer la description selon l'état
  const getTruncatedDescription = (description: string): string => {
    if (!adaptiveConfig.shouldShowDescription) return '';
    
    switch (adaptiveConfig.state) {
      case 'compact':
        return description.slice(0, 15) + (description.length > 15 ? '...' : '');
      case 'normal':
        return description.slice(0, 80) + (description.length > 80 ? '...' : '');
      case 'extended':
      default:
        return description;
    }
  };

  // Déterminer si l'événement est passé
  const isPastEvent = new Date(event.event_date) < new Date();
  
  // Déterminer si l'utilisateur peut supprimer
  const canDelete = currentUserId === event.created_by;

  // Gérer les réponses aux événements
  const handleEventResponse = async (status: string) => {
    if (!onEventResponse) return;
    
    try {
      setIsLoading(true);
      await onEventResponse(event.id, status);
    } catch (error) {
      console.error('Erreur lors de la réponse à l\'événement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la suppression
  const handleDelete = async () => {
    if (!onDeleteEvent || !canDelete) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        setIsLoading(true);
        await onDeleteEvent(event.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <article 
      className={cardClasses}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Événement ${event.title}`}
    >
      {/* Layout 2 colonnes : informations (3/4) + boutons (1/4) */}
      <div className="flex gap-2 h-full">
        {/* Colonne informations (3/4 de la largeur) */}
        <div className="flex-1 min-w-0 flex flex-col" style={{width: '75%'}}>
          <header className="vignette-meta">
            <h3 className="vignette-title text-emerald-400 font-semibold truncate">
              {event.title}
            </h3>
            <time 
              className="text-xs opacity-70 flex items-center gap-1"
              dateTime={event.event_date}
            >
              <span>📅</span>
              <span>{formatEventDate(event.event_date)}</span>
            </time>
          </header>
        </div>

        {/* Colonne boutons (1/4 de la largeur) */}
        <div className="flex-shrink-0 flex flex-col justify-start gap-0.5" style={{width: '25%'}}>
          {!isPastEvent && !isLoading && (
            <>
              <button
                onClick={() => handleEventResponse('going')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded flex items-center justify-center h-6 text-xs leading-none flex-shrink-0"
                disabled={isLoading}
                title="Participer à cet événement"
              >
                {adaptiveConfig.state === 'compact' ? '✓' : 'Participe'}
              </button>
              
              <button
                onClick={() => handleEventResponse('not_going')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium rounded flex items-center justify-center h-6 text-xs leading-none flex-shrink-0"
                disabled={isLoading}
                title="Ne pas participer à cet événement"
              >
                {adaptiveConfig.state === 'compact' ? '✗' : 'Non'}
              </button>

              <button
                onClick={() => handleEventResponse('maybe')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium rounded flex items-center justify-center h-6 text-xs leading-none flex-shrink-0"
                disabled={isLoading}
                title="Peut-être participer à cet événement"
              >
                {adaptiveConfig.state === 'compact' ? '?' : 'Peut-être'}
              </button>
            </>
          )}
          
          {/* Indicateur de chargement */}
          {isLoading && (
            <span className="animate-spin text-gray-400 text-xs text-center">⟳</span>
          )}
        </div>
      </div>

      {/* Description de l'événement */}
      {adaptiveConfig.shouldShowDescription && (
        <div className="vignette-description text-gray-200 flex-1">
          {getTruncatedDescription(event.description)}
        </div>
      )}

      {/* Informations supplémentaires (état normal/étendu) */}
      {adaptiveConfig.state !== 'compact' && (
        <div className="vignette-meta">
          <div className="flex items-center gap-4 text-xs">
            {/* Créateur (état étendu uniquement) */}
            {adaptiveConfig.state === 'extended' && (
              <span className="opacity-70">
                Créé par {event.creator_username}
              </span>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="flex items-center gap-1 text-gray-400">
                <span className="animate-spin">⟳</span>
                <span className="text-xs">Traitement...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions secondaires de l'événement (seulement en extended) */}
      {adaptiveConfig.state === 'extended' && (
        <footer className="vignette-actions">
          <div className="flex-1 flex items-center gap-2">
            {/* Bouton supprimer (visible pour créateur) */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-400 font-medium flex items-center gap-1"
                disabled={isLoading}
                title="Supprimer cet événement"
              >
                🗑 Supprimer
              </button>
            )}

            {/* Actions de partage */}
            <button className="secondary-action text-gray-400 hover:text-gray-300 font-medium">
              📤 Partager
            </button>
            <button className="secondary-action text-gray-400 hover:text-gray-300 font-medium">
              📋 Copier le lien
            </button>
          </div>
        </footer>
      )}

      {/* Détails supplémentaires (état étendu uniquement) */}
      {adaptiveConfig.state === 'extended' && !isPastEvent && (
        <section className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="font-semibold text-sm mb-2">Informations supplémentaires</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="opacity-70">Créé le:</span>
              <br />
              <span>{new Date(event.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div>
              <span className="opacity-70">Statut:</span>
              <br />
              <span className="text-emerald-400">Ouvert aux inscriptions</span>
            </div>
          </div>
        </section>
      )}

      {/* Indicateur de hover (état étendu) */}
      {isHovered && adaptiveConfig.state === 'extended' && (
        <div className="absolute inset-0 border border-emerald-400/30 rounded-lg pointer-events-none" />
      )}
    </article>
  );
}