"use client";
import { redirect } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { url } from "../login/page";

export const Navbar = ({
  user,
}: {
  user: { id: number; email: string; first_name: string; last_name: string; birth_date :string; username: string; is_public: string; created_at: string; updated_at: string;}
}) => {
    const cookies = useCookies()
    const jwt = cookies.get("jwt")
    return (
        <>
            <nav className="navbar">
                <button className="logo" onClick={() => {
                redirect("/home")
            }}>LOGO</button>
            <div className="searchbar">ITS A SEARCHBAR TRUST ME</div>
            <div className="nav">
                Welcome {user.username} !
                💬
                🔔
                🧑🏽‍🦱
                <button onClick={async () => {
                    fetch(url+"/user", {
                        method:"POST",
                        body: JSON.stringify({
                            jwt: jwt
                        })
                    })
                    cookies.remove("jwt")
                    redirect("/")
                }}>⏼</button>
            </div>
            </nav>
        </>
    )
}