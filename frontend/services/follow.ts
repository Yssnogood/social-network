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
  if (!res.ok) throw new Error("Erreur lors du follow");
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

  if (!res.ok) throw new Error("Erreur lors du unfollow");
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
