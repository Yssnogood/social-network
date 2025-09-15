// Check if a user has a pending group invitation
export async function checkGroupInvitationStatus(groupId: number, userId: number) {
  const res = await fetch("http://localhost:8080/api/groups/check-invitation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      group_id: groupId,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la vérification du statut d'invitation");
  }

  return await res.json();
}
