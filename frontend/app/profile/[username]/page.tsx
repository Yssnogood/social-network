import { getUserProfile, getCurrentUser, UserProfile } from "../../../services/user";
import { fetchFollowers } from "@/services/follow";
import ClientProfile from "./Profile";

export default async function Profile(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  
  const profile: UserProfile = await getUserProfile(username, false);
  const userLogin: UserProfile = await getCurrentUser();
  
  const followers = await fetchFollowers(profile.id);
  
  return (
    <ClientProfile
      profile={profile}
      loggedInUser={userLogin.username}
      currentUserId={userLogin.id}
	  followers={followers}
    />
  );
}
