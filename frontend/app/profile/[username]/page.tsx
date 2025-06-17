import { getUserProfile, UserProfile } from "../../../services/user";
import { cookies } from "next/headers";
import ClientProfile from "./Profile";

export default async function Profile(props: { params: { username: string } }) {
  const params = await props.params; 
  const username = params.username;

  const cookieStore = await cookies(); 
  const loggedInUser = cookieStore.get("user")?.value || "";

  const profile: UserProfile = await getUserProfile(username, false);

  return <ClientProfile profile={profile} loggedInUser={loggedInUser} />;
}
