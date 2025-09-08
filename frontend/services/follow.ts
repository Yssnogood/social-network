import { dispatchFollowStatusChange } from './followEvents';

export interface Follower {
  follower_id: number;
  followed_id: number;
  accepted: boolean;
  followed_at: string;
}

export interface FollowerUser {
  id: number;
  username: string;
  avatar_path: string;
}


export async function followUser(_followerId: number, followedId: number, _is_public: boolean) {
  console.log("Following user:", _followerId, followedId, _is_public);
  const res = await fetch("http://localhost:8090/api/followers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important pour envoyer les cookies JWT
    body: JSON.stringify({ followed_id: followedId }), // follower_id maintenant récupéré du JWT
  });
  
  console.log("Follow response OK:", res.ok)
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Follow error details:", res.status, errorText);
    
    if (res.status === 409) {
      throw new Error("Vous suivez déjà cet utilisateur");
    } else if (res.status === 400) {
      throw new Error("Impossible de se suivre soi-même");
    } else if (res.status === 401) {
      throw new Error("Vous devez être connecté pour suivre un utilisateur");
    }
    
    throw new Error(`Erreur lors du follow: ${errorText || res.statusText}`);
  }
  
  // Récupérer la réponse pour savoir si c'est accepté ou en attente
  const responseData = await res.json();
  console.log("Follow response data:", responseData);
  
  // Dispatcher l'événement selon la réponse du serveur
  const isAccepted = responseData.message === "User followed successfully";
  const isPending = responseData.message === "Follow request sent";
  
  dispatchFollowStatusChange(followedId, isAccepted, isPending);
  
  // Retourner l'info pour que le composant sache s'il faut créer une notification
  return { isAccepted, isPending };
}

export async function unfollowUser(_followerId: number, followedId: number) {
  const res = await fetch(`http://localhost:8090/api/followers/${followedId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important pour envoyer les cookies JWT
    body: JSON.stringify({ followed_id: followedId }), // follower_id maintenant récupéré du JWT
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Unfollow error details:", res.status, errorText);
    
    if (res.status === 401) {
      throw new Error("Vous devez être connecté pour annuler un follow");
    } else if (res.status === 404) {
      throw new Error("Relation de follow non trouvée");
    }
    
    throw new Error(`Erreur lors du unfollow: ${errorText || res.statusText}`);
  }
  
  // Dispatcher l'événement de changement de statut - plus de follow ni pending
  dispatchFollowStatusChange(followedId, false, false);
  
  // Retourner l'info de cohérence avec followUser
  return { isAccepted: false, isPending: false };
}


export const fetchFollowers = async (userId: number): Promise<FollowerUser[]> => {
  try {
    const response = await fetch(`http://localhost:8090/api/followersDetails?userID=${userId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erreur HTTP:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur lors du fetch des followers:", error);
    return [];
  }
};
