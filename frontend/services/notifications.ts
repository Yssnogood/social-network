export async function fetchNotifications(token: string, user_id: string) {
  const res = await fetch(`http://localhost:8080/api/notifications/get`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: parseInt(user_id) }),
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
  const res = await fetch("http://localhost:8080/api/notifications", {
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

export async function acceptFriendRequestNotif(notificationId: number, user_id: number, reference_id: number) {
  const res = await fetch("http://localhost:8080/api/followers/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      notification_id: notificationId,
      followed_id: user_id,
      follower_id: reference_id }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'acceptation de la demande d'ami.");
  }

  return res.json();
}

export async function declineFriendRequestNotif(notificationId: number, user_id: number, reference_id: number) {
  const res = await fetch("http://localhost:8080/api/followers/decline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
    notification_id: notificationId,
    followed_id: user_id,
    follower_id: reference_id }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du refus de la demande d'ami.");
  }

  return res.json();
}