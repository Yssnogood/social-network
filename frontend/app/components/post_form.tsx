"use client";

import Head from "next/head";
import { useState } from "react";
import { url } from "../login/page";
import { useCookies } from "next-client-cookies";

export default function PostForm() {
    const jwt = useCookies().get("jwt")
    const [privacy,setPrivacy] = useState(0);
    const [content,setContent] = useState("");

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const resp = await fetch(url+"/posts",{
                method: "POST",
                body: JSON.stringify({
                    jwt: jwt,
                    content: content,
                    privacy_type: privacy
                })
            })
            if (resp.ok) {
                const r = await resp.json()
                console.log(r)
            } else {
                console.log(resp.status)
            }
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <>
    <Head>
      <title>Post</title>
    </Head>
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      
        
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Post</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Make a post</p>
        </div>

        <form onSubmit={handlePost} className="mt-8 space-y-6">
          <div className="space-y-4">

            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Privacy
              </label>
              <select
                id="privacy"
                name="privacy"
                required
                value={privacy}
                onChange={(e) => {setPrivacy(Number(e.target.value))}}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              > 
              <option value="0">🌍 Public</option>
              <option value="1">🙎‍♂️ Friends</option>
              <option value="2">🔒 Private (You can choose who can see this post)</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-med font-medium text-gray-700 dark:text-gray-300">
                Content
              </label>
              <textarea id="content"
                name="content"
                value={content}
                onChange={(e) => {setContent(e.target.value)}}
                required
                placeholder="What's New ?"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Post
            </button>
          </div>
        </form>

      </div>
    </div>
    </>
    )
}