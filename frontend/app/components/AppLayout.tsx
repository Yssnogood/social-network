"use client";

import { useState, useEffect, useCallback } from "react";
import { useCookies } from "next-client-cookies";
import Header, { Notification } from "./Header";
import { fetchNotifications } from "@/services/notifications";
import { getUserIdFromToken } from "@/services/user";
import { WebSocketProvider } from "../context/WebSocketContext";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const cookies = useCookies();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = cookies.get("jwt");

  // Callback pour traiter les nouvelles notifications WebSocket
  const handleNewNotification = useCallback((newNotification: Notification) => {
    console.log("🔔 Adding new notification to state:", newNotification);
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

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
  }, [cookies, showHeader, token]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <WebSocketProvider
      onNewNotification={handleNewNotification}
      token={token}
    >
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
    </WebSocketProvider>
  );
}
