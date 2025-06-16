import { getUserProfile, UserProfile } from "../../../services/user";
import { cookies } from "next/headers";
import ClientProfile from "./Profile";

export default async function Profile({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const cookieStore =  await cookies();
  const loggedInUser =  cookieStore.get("user")?.value || "";

  // Fetch user profile data (mock flag can be toggled)
  const profile: UserProfile = await getUserProfile(username, false);

  return <ClientProfile profile={profile} loggedInUser={loggedInUser} />;
}
