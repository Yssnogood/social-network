// Service pour gérer les événements de follow et synchroniser les interfaces

export interface FollowStatusChangeEvent {
  userId: number;
  isFollowing: boolean;
  isPending: boolean;
}

// Événements personnalisés pour la synchronisation
export const FOLLOW_STATUS_CHANGED = 'followStatusChanged';

// Dispatcher un changement de statut de follow
export const dispatchFollowStatusChange = (userId: number, isFollowing: boolean, isPending: boolean) => {
  const event = new CustomEvent(FOLLOW_STATUS_CHANGED, {
    detail: { userId, isFollowing, isPending } as FollowStatusChangeEvent
  });
  window.dispatchEvent(event);
};

// Écouter les changements de statut de follow
export const addFollowStatusListener = (callback: (event: FollowStatusChangeEvent) => void) => {
  const handleEvent = (e: Event) => {
    const customEvent = e as CustomEvent<FollowStatusChangeEvent>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(FOLLOW_STATUS_CHANGED, handleEvent);
  
  // Retourner une fonction de nettoyage
  return () => window.removeEventListener(FOLLOW_STATUS_CHANGED, handleEvent);
};
