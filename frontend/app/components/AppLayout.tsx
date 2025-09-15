"use client";

import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import Header, { Notification } from "./Header";
import { fetchNotifications } from "@/services/notifications";
import { getUserIdFromToken } from "@/services/user";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const cookies = useCookies();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les notifications une seule fois dans le layout
  useEffect(() => {
    const getNotifications = async () => {
      const token = cookies.get("jwt");
      const userId = await getUserIdFromToken(token);
      if (!token || !userId) return;

      try {
        const fetchedNotifications = await fetchNotifications(token, userId);
        if (Array.isArray(fetchedNotifications)) {
          setNotifications(fetchedNotifications);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (showHeader) {
      getNotifications();
    }
  }, [cookies, showHeader]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
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
      
      <main className={showHeader ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
}
