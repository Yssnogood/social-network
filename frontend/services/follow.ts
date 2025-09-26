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

const apiUrl =  process.env.NEXT_PUBLIC_API_URL;

export async function followUser(
  followerId: number,
  followedId: number,
  is_public: boolean
): Promise<{ followed?: boolean; requestSent?: boolean }> {
  console.log("Following user:", followerId, followedId, is_public);
  console.log(`${apiUrl}/followers`)
  const res = await fetch(`${apiUrl}/followers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      follower_id: followerId,
      followed_id: followedId,
      is_public: is_public, // ✅ Correct field name
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du follow");
  }

  return res.json(); // ✅ Return backend response with `followed` or `requestSent`
}


export async function unfollowUser(followerId: number, followedId: number) {
  const res = await fetch(`${apiUrl}/followers/${followedId}`, {
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
    const response = await fetch(`${apiUrl}/followersDetails?userID=${userId}`, {
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
