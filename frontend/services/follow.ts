export async function followUser(followerId: number, followedId: number) {
  const res = await fetch("http://localhost:8080/api/followers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ follower_id: followerId, followed_id: followedId }),
  });

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
