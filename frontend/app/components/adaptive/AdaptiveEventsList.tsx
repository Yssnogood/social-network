'use client';

import React, { useState } from 'react';
import { Event, User } from '../../types/group';
import AdaptiveEventCard from './AdaptiveEventCard';
import EventCreator from '../groupComponent/EventCreator';

interface AdaptiveEventsListProps {
  events: Event[];
  isLoading?: boolean;
  drawerPercentage: number;
  currentUser?: User | null;
  currentUserStatus?: 'going' | 'not_going' | 'maybe' | null;
  selectedEventId?: number; // 🔧 Ajout de l'ID de l'événement sélectionné
  onEventResponse?: (eventId: number, status: string) => Promise<void>;
  onDeleteEvent?: (eventId: number) => Promise<void>;
  onCreateEvent?: (title: string, description: string, eventDate: string) => Promise<void>;
}

export default function AdaptiveEventsList({
  events,
  isLoading = false,
  drawerPercentage,
  currentUser,
  currentUserStatus,
  selectedEventId,
  onEventResponse,
  onDeleteEvent,
  onCreateEvent,
}: AdaptiveEventsListProps) {
  
  // État pour forcer l'affichage du créateur en mode compact
  const [showCompactCreator, setShowCompactCreator] = useState(false);
  
  // 🔧 DEBUG: Logger pour comprendre le problème de grisage
  console.log(`🔧 DEBUG AdaptiveEventsList:`, {
    eventsCount: events?.length || 0,
    selectedEventId,
    currentUserStatus,
    currentUserId: currentUser?.id
  });
  
  // Déterminer l'espacement selon la taille du tiroir
  const getSpacing = () => {
    if (drawerPercentage <= 30) return 'space-y-1'; // Compact
    if (drawerPercentage >= 60) return 'space-y-4'; // Extended
    return 'space-y-2'; // Normal
  };

  // Vérification de sécurité et séparation des événements
  const now = new Date();
  const safeEvents = events || [];
  const upcomingEvents = safeEvents.filter(event => new Date(event.event_date) >= now);
  const pastEvents = safeEvents.filter(event => new Date(event.event_date) < now);

  return (
    <div className={`${getSpacing()} h-full flex flex-col overflow-hidden`}>
      {/* Créateur d'événement - toujours présent, adaptatif selon l'espace */}
      {onCreateEvent && (
        <div className="flex-shrink-0 mb-2">
          {drawerPercentage >= 40 || showCompactCreator ? (
            <EventCreator 
              onCreateEvent={async (title, description, eventDate) => {
                await onCreateEvent(title, description, eventDate);
                setShowCompactCreator(false); // Fermer après création
              }}
              compact={drawerPercentage <= 55}
            />
          ) : (
            // Bouton + compact pour créer un événement
            <div className="flex justify-center">
              <button 
                onClick={() => setShowCompactCreator(true)}
                className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                title="Créer un événement"
                aria-label="Créer un nouvel événement"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section titre adaptatif */}
      {drawerPercentage >= 25 && (
        <div className="flex-shrink-0">
          <h3 className={`font-semibold text-gray-200 ${
            drawerPercentage <= 30 ? 'text-sm' : 
            drawerPercentage >= 60 ? 'text-lg' : 'text-base'
          }`}>
            Événements {drawerPercentage >= 45 && 'du groupe'}
            {drawerPercentage <= 40 && safeEvents.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded">
                {upcomingEvents.length}
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
                <p className="text-gray-400 text-sm">Chargement des événements...</p>
              </>
            ) : (
              <div className="animate-spin text-gray-400">⟳</div>
            )}
          </div>
        </div>
      )}

      {/* Empty state adaptatif */}
      {!isLoading && safeEvents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            {drawerPercentage >= 50 ? (
              <>
                <div className="text-4xl mb-4 opacity-50">📅</div>
                <p className="mb-2">Aucun événement prévu.</p>
                <p className="text-sm opacity-75">Les nouveaux événements apparaîtront ici.</p>
              </>
            ) : drawerPercentage >= 30 ? (
              <>
                <div className="text-2xl mb-2 opacity-50">📅</div>
                <p className="text-sm">Aucun événement</p>
              </>
            ) : (
              <div className="text-gray-400">Vide</div>
            )}
          </div>
        </div>
      )}

      {/* Contenu des événements */}
      {!isLoading && safeEvents.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {/* Événements à venir */}
          {upcomingEvents.length > 0 && (
            <section className="mb-4">
              {drawerPercentage >= 35 && (
                <h4 className={`font-medium text-emerald-400 mb-2 ${
                  drawerPercentage <= 40 ? 'text-sm' : 'text-base'
                }`}>
                  {drawerPercentage >= 50 ? '📅 Événements à venir' : 'À venir'}
                  {drawerPercentage <= 45 && (
                    <span className="ml-2 text-xs opacity-70">
                      ({upcomingEvents.length})
                    </span>
                  )}
                </h4>
              )}
              
              <div className={getSpacing()}>
                {upcomingEvents.map((event) => (
                  <AdaptiveEventCard
                    key={event.id}
                    event={event}
                    drawerPercentage={drawerPercentage}
                    currentUserId={currentUser?.id}
                    currentUserStatus={currentUserStatus}
                    onEventResponse={onEventResponse}
                    onDeleteEvent={onDeleteEvent}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Événements passés (seulement en mode étendu) */}
          {pastEvents.length > 0 && drawerPercentage >= 55 && (
            <section>
              <h4 className="font-medium text-gray-400 mb-2 text-base">
                📋 Événements passés
                <span className="ml-2 text-xs opacity-70">
                  ({pastEvents.length})
                </span>
              </h4>
              
              <div className={getSpacing()}>
                {pastEvents.slice(0, 5).map((event) => (
                  <AdaptiveEventCard
                    key={event.id}
                    event={event}
                    drawerPercentage={drawerPercentage}
                    currentUserId={currentUser?.id}
                    currentUserStatus={currentUserStatus}
                    onEventResponse={onEventResponse}
                    onDeleteEvent={onDeleteEvent}
                  />
                ))}
                
                {pastEvents.length > 5 && (
                  <div className="text-center py-2">
                    <button className="text-sm text-gray-400 hover:text-gray-300">
                      Voir {pastEvents.length - 5} événements de plus...
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Indicateur de scroll et statistiques (état étendu) */}
      {!isLoading && safeEvents.length > 0 && drawerPercentage >= 60 && (
        <div className="flex-shrink-0 text-center py-2 border-t border-gray-700">
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>
              <span className="text-emerald-400">{upcomingEvents.length}</span> à venir
            </span>
            {pastEvents.length > 0 && (
              <span>
                <span className="text-gray-400">{pastEvents.length}</span> terminés
              </span>
            )}
            <span>
              Total: <span className="text-blue-400">{safeEvents.length}</span>
            </span>
          </div>
        </div>
      )}

      {/* Indicateur compact pour les événements à venir */}
      {!isLoading && drawerPercentage <= 30 && upcomingEvents.length > 0 && (
        <div className="flex-shrink-0 text-center py-1">
          <div className="text-xs text-emerald-400">
            {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''} prochains
          </div>
        </div>
      )}
    </div>
  );
}