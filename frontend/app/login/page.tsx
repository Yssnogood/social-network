"use client";

import Link from "next/link";
import Head from "next/head";
import React, { useState } from 'react'
import { redirect } from "next/navigation";
import { useCookies } from "next-client-cookies";
export const url = "http://localhost:8080/api"
export default function Login() {
    const cookies = useCookies()
    if (cookies.get('jwt') != undefined) {
        redirect('/home')
    }
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(url+"/login",{
        method:"POST",
        body:JSON.stringify({
          email:email.toLowerCase(),
          password:password
        })
      })
      if (resp.ok) {
        console.log("OK")
        const r = await resp.json()
        cookies.set('jwt',r.jwt,{
          expires:1,
          path: '/',
        })
        cookies.set('user',r.username,{
          expires:1,
          path: '/',
      })
      cookies.set('userID',r.userID,{
          expires:1,
          path: '/',
      })
        redirect('/home')
      } else {
        console.error('Invalid Credentials')
      }
    } catch (error) {
      if (error) {
      console.log("Fetch error")
      }
    }
  
  }
  return (
    <>
    <Head>
      <title>Login</title>
    </Head>
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      
        
      <div className="w-full max-w-md space-y-8 bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Login</h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    // autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    // autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>

                <Link href="/" className="mt-8 text-sm text-gray-400 hover:underline">
                    ← Back to home
                </Link>
            </div>
        </>
    );
}
