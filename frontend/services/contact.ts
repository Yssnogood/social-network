import { url } from "@/app/login/page";
import { useRef, useEffect } from "react";

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

export async function fetchUserConversation() {
  const resp = await fetch(url + "/messages/user/conversations",{
    method:"GET",
    credentials: "include"
  })
  const r = await resp.json()
  if (!r) {
    return []
  }
  return r
}

export async function fetchMessages(conversation_id:number) {
  const resp = await fetch(url + `/messages?conversation_id=${conversation_id}`, {
    method: "GET",
    credentials: "include"
  })
  const r = await resp.json()
  return r
}