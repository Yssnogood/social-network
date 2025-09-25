"use client";
import { redirect } from "next/navigation";
import { url } from "@/lib/config";
import { useCookies } from "next-client-cookies";
import { useWebSocketClear } from "../context/WebSocketContext";

export default function Logout() {
    const cookies = useCookies()
    const clearUserData = useWebSocketClear()
    const jwt = cookies.get("jwt")
    fetch(url+"/logout",{
        method: "POST",
        body: JSON.stringify({
            jwt: jwt
        })
    })
    // Nettoyer toutes les données utilisateur du contexte WebSocket
    clearUserData();
    cookies.remove("jwt")
    cookies.remove("user")
    cookies.remove("userID");
    redirect("/")
}