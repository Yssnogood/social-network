"use client";

import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import Header, { Notification } from "./Header";
import { fetchNotifications } from "@/services/notifications";
import { getUserIdFromToken } from "@/services/user";
import { url } from "@/lib/config";
import { useNotifications } from "../context/WebSocketContext";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const cookies = useCookies();
  const [showNotifications, setShowNotifications] = useState(false);
  const token = cookies.get("jwt");
  const {notifications,setNotifications} = useNotifications();

  const handleDeleteNotifications = async (notification_id: number) => {
    const resp = await fetch(`${url}/notifications/${notification_id}`,
      {
        method: "DELETE"
      }
    )
    if (!resp.ok) throw new Error(`Error Deleting Notifications:${resp.text}`);
  }

  // Charger les notifications initiales
  useEffect(() => {
    const getNotifications = async () => {
      const userId = await getUserIdFromToken(token);
      if (!token || !userId) return;

      try {
        const fetchedNotifications = await fetchNotifications(token, userId);
        if (Array.isArray(fetchedNotifications)) {
          setNotifications(fetchedNotifications.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (showHeader) {
      getNotifications();
    }
  }, [cookies, showHeader, token, setNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) return;
    if (showNotifications === true) {
    const newNotifs : Notification[] = [];
      notifications.map((notification) => {
        if (notification.type !== 'group_request' && notification.type !== 'group_invitation' && notification.type !== 'follow_request' ) {
          handleDeleteNotifications(notification.id)
        } else {
          newNotifs.push(notification)
        }
      })
      setNotifications(newNotifs)
    }
  };

  return (
        <div className="min-h-screen bg-zinc-950">
        {showHeader && (
          <Header
            username={cookies.get("user")}
            notifications={notifications}
            showNotifications={showNotifications}
            onToggleNotifications={handleToggleNotifications}
          />
        )}
        
        <main>
          {children}
        </main>
      </div>
  );
}
