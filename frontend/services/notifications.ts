export async function fetchNotifications(userId: string) {
  const res = await fetch(`/api/notifications/get`, {
    method: "POST", // CORRIGÉ : POST au lieu de GET
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }), // CORRIGÉ : ajout du body
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des notifications.");
  }

  return res.json();
}

export async function createNotification(notification: {
  userId: number;
  type: string;
  content: string;
  read?: boolean;
  referenceId?: number;
  referenceType?: string;
}) {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: notification.userId,
      type: notification.type,
      content: notification.content,
      read: notification.read ?? false,
      reference_id: notification.referenceId ?? null,
      reference_type: notification.referenceType ?? null,
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création de la notification.");
  }

  return res.json();
}
