"use client";

import Link from "next/link";
import { useState } from "react";
import { redirect } from "next/navigation";
import { url } from "../login/page";
import { useCookies } from "next-client-cookies";
export default function Register() {
    const cookies = useCookies()
    if (cookies.get('jwt') != undefined) {
        redirect('/home')
    }
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            console.error('Not Same Password')
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
                    password: password
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
                    cookies.set("jwt", loginResult.jwt)
                    cookies.set("user", loginResult.user)

                    // Redirection vers la page home
                    redirect("/home")
                } else {
                    console.error("Login after registration failed")
                    // Fallback: rediriger vers login si la connexion auto échoue
                    redirect("/login")
                }
            } else {
                console.error("Registration failed")
            }
        } catch (err) {
            console.log("Error Fetching", err)
        }
    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Register</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
                </div>

                <form onSubmit={handleRegister} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                onChange={(e) => setUserName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Birth Date
                            </label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                required
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>


                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <Link href="/" className="mt-8 text-sm text-gray-600 dark:text-gray-400 hover:underline">
                ← Back to home
            </Link>
        </div>
    );
}
