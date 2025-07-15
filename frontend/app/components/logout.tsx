"use client";
import { redirect } from "next/navigation";
import { url } from "../login/page";
import { useCookies } from "next-client-cookies";

export default function Logout() {
    const cookies = useCookies()
    const jwt = cookies.get("jwt")
    fetch(url+"/logout",{
        method: "POST",
        body: JSON.stringify({
            jwt: jwt
        })
    })
    cookies.remove("jwt")
    cookies.remove("user")
    redirect("/")
}