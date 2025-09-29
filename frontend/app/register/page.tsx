"use client";

import Link from "next/link";
import { CldUploadButton } from "next-cloudinary";
import React, { useState } from "react";
import { redirect } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { url } from "@/lib/config";

export default function Register() {
    const cookies = useCookies();
    
    if (cookies.get('jwt') != undefined) {
        redirect('/home');
    }
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [profileImageURL, setProfileImageURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return
        }
        try {
            // Étape 1: Inscription
            const resp = await fetch(url + '/register', {
                method: "POST",
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username: userName,
                    birth_date: birthDate,
                    email: email.toLowerCase(),
                    password: password,
                    about_me: aboutMe,
                    avatar_path: profileImageURL
                })
            })

            if (resp.ok) {
                const r = await resp.json()
                console.log(r.message)

                // Étape 2: Connexion automatique après inscription
                const loginResp = await fetch(url + '/login', {
                    method: "POST",
                    body: JSON.stringify({
                        email: email.toLowerCase(),
                        password: password
                    })
                })

                if (loginResp.ok) {
                    const loginResult = await loginResp.json()
                    console.log(loginResult.message)

                    // Sauvegarder le JWT et les infos utilisateur dans les cookies
                    cookies.set("jwt", loginResult.jwt, {
                        expires: 1,
                        path: '/',
                    });
                    cookies.set("user", loginResult.user, {
                        expires: 1,
                        path: '/',
                    });

                    // Redirection vers la page home
                    redirect("/home")
                } else {
                    console.error("Login after registration failed")
                    // Fallback: rediriger vers login si la connexion auto échoue
                    redirect("/login")
                }
            } else {
                const errorData = await resp.text();
                setError(errorData || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.log("Error Fetching", err)
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4">
                <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SN</span>
                    </div>
                    <span>Social Network</span>
                </Link>
            </div>

            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white">Create your account</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Join our community today
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300">
                                    First name
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    className="bg-zinc-800 border-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300">
                                    Last name
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    className="bg-zinc-800 border-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                                Username
                            </label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Choose a username"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="birthDate" className="block text-sm font-medium text-zinc-300">
                                Birth Date
                            </label>
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                required
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                                Email address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                                Confirm password
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="aboutMe" className="block text-sm font-medium text-zinc-300">
                                About Me
                            </label>
                            <textarea
                                id="aboutMe"
                                name="aboutMe"
                                rows={3}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={aboutMe}
                                onChange={(e) => setAboutMe(e.target.value)}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Profile Picture</label>
                            <CldUploadButton
                                options={{ sources: ["local", "url"] }}
                                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}
                                onSuccess={(result: any) => {
                                    if (result.info && typeof result.info !== "string") {
                                        setProfileImageURL(result.info.secure_url);
                                    }
                                }}
                            >
                                <span className="text-sm text-blue-400 underline cursor-pointer">Upload Image</span>
                            </CldUploadButton>
                            {profileImageURL && (
                                <div className="mt-2">
                                    <img src={profileImageURL} alt="Profile preview" className="rounded-md max-h-40" />
                                </div>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
