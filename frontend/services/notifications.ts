import jwt from "jsonwebtoken";

// Fetch the notifications to display on their notification panel
export async function fetchNotifications(token: string, user_id: string) {
  const res = await fetch(`http://localhost:8080/api/notifications/get`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ user_id: parseInt(user_id) }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des notifications.");
  }
  return res.json();
}

// Create a new notification, with dynamic content, reference ID and type, depending on the usage.
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

// Accept a follow request (from the notification)
export async function acceptFollowRequestNotif(notificationId: number, user_id: number, reference_id: number) {
  const res = await fetch("http://localhost:8080/api/followers/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notification_id: notificationId,
      followed_id: user_id,
      follower_id: reference_id
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'acceptation de la demande de follow.");
  }

  // Check if response has content before parsing JSON
  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("Response is not valid JSON:", text);
      return { success: true };
    }
  }
  return { success: true };
}

// Decline a follow request (from the notification)
export async function declineFollowRequestNotif(notificationId: number, user_id: number, reference_id: number) {
  const res = await fetch("http://localhost:8080/api/followers/decline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notification_id: notificationId,
      followed_id: user_id,
      follower_id: reference_id
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du refus de la demande de follow.");
  }

  // Check if response has content before parsing JSON
  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("Response is not valid JSON:", text);
      return { success: true };
    }
  }
  return { success: true };
}

// Accept a join group request (from the notification)
export async function acceptGroupJoinRequest(reference_id: number, user_id: number, reference_type: string) {
  const res = await fetch("http://localhost:8080/api/groups/accept-invitation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group_id: reference_id,
      current_user: user_id,
      reference_type: reference_type,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error accepting group invitation:", errorText);
    throw new Error("Erreur lors de l'acceptation de l'invitation au groupe.");
  }

  // Check if response has content before parsing JSON
  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("Response is not valid JSON:", text);
      return { success: true };
    }
  }
  return { success: true };
}

// Decline a join group request (from the notification)
export async function declineGroupJoinRequest(reference_id: number, user_id: number, reference_type: string) {
  const res = await fetch("http://localhost:8080/api/groups/decline-invitation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group_id: reference_id,
      current_user: user_id,
      reference_type: reference_type
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du refus de l'invitation au groupe.");
  }

  // Check if response has content before parsing JSON
  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("Response is not valid JSON:", text);
      return { success: true };
    }
  }
  return { success: true };
}