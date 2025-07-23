export async function fetchUsersByUsername(query: string, current: string): Promise<any[]> {
  if (current === 'error') {
    console.error('Invalid user ID provided');
    return [];
  }
  try {
    const res = await fetch(`http://localhost:8080/api/users/search/${encodeURIComponent(query)}/${current}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export async function fetchUserConversation(jwt: string) {
  if (jwt == "") {
    return
  }
  const resp = await fetch(url + "/messages/user/conversations",{
    method:"GET",
    headers: {
      Credentials: `Bearer ${jwt}`
    }
  })
  if (!resp.ok) throw new Error("Failed to fetch user's conversations")
  return resp.json()
}