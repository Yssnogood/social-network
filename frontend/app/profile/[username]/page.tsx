import { getUserProfile, UserProfile } from "../../../services/user";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ClientProfile from "./Profile";

interface Follower {
  follower_id: number;
  followed_id: number;
  accepted: boolean;
  followed_at: string;
}

export default async function Profile(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params; 

  const cookieStore =  await cookies();
  const token = cookieStore.get("jwt")?.value || "";

  let userId = "";

  if (token) {
    try {
      const decoded = jwt.decode(token) as { user_id?: number } | null;
      userId = decoded?.user_id?.toString() || "";
    } catch (e) {
      console.error("Erreur lors du décodage du JWT :", e);
    }
  }

  const loggedInUser = cookieStore.get("user")?.value || "";
  const profile: UserProfile = await getUserProfile(username, false);

  const fetchFollowers = async (userId: string): Promise<Follower[]> => {
    try {
      const apiUrl = `http://localhost:8080/api/followers?user_id=${userId}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(' Erreur HTTP:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(' Erreur lors du fetch:', error);
      return [];
    }
  };

  const rawFollowers = await fetchFollowers(userId);
  const followers: Follower[] = Array.isArray(rawFollowers) ? rawFollowers : [];

  return (
    <ClientProfile
      profile={profile}
      loggedInUser={loggedInUser}
      followers={followers}
      currentUserId={parseInt(userId)}
    />
  );
}
