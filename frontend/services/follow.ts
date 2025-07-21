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


export async function followUser(followerId: number, followedId: number, is_public: boolean) {
  console.log("Following user:", followerId, followedId, is_public);
  const res = await fetch("http://localhost:8080/api/followers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify({ follower_id: followerId, followed_id: followedId, private: is_public == true ? 1 : 0 }),
  });
  
  console.log("test")
  console.log(res.ok)
  if (!res.ok) throw new Error("Erreur lors du follow");
}

export async function unfollowUser(followerId: number, followedId: number) {
  const res = await fetch(`http://localhost:8080/api/followers/${followedId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ follower_id: followerId, followed_id: followedId }),
  });

  if (!res.ok) throw new Error("Erreur lors du unfollow");
}


export const fetchFollowers = async (userId: number): Promise<FollowerUser[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/followersDetails?userID=${userId}`, {
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
