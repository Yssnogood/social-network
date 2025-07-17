import { getUserProfile, UserProfile } from "../../../services/user";
import { fetchFollowers } from "@/services/follow";
import { cookies } from "next/headers";
import ClientProfile from "./Profile";

export default async function Profile(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;

  const cookieStore = await cookies();
  const loggedInUser = cookieStore.get("user")?.value || "";
  

  
  const profile: UserProfile = await getUserProfile(username, false);
  const userLogin: UserProfile = await getUserProfile(loggedInUser, false);
  
  const followers = await fetchFollowers(profile.id);
  
  return (
    <ClientProfile
      profile={profile}
      loggedInUser={profile.username}
      currentUserId={userLogin.id}
	  followers={followers}
    />
  );
}
