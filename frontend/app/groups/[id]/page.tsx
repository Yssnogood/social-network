'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Group = {
	id: number
	creatorId: number
	creatorName: string
	title: string
	description: string
	createdAt: string
	updatedAt: string
}

type GroupMember = {
	id: number
	groupId: number
	userId: number
	username: string
	accepted: boolean
	createdAt: string
}

interface Follower {
	follower_id: number
	followed_id: number
	accepted: boolean
	followed_at: string
}

type GroupMessage = {
	id: number
	group_id: number
	user_id: number
	username: string
	content: string
	created_at: string
	updated_at: string
}

export default function GroupPage() {
	const { id } = useParams()

	const [group, setGroup] = useState<Group | null>(null)
	const [members, setMembers] = useState<GroupMember[]>([])
	const [followers, setFollowers] = useState<Follower[]>([])
	const [messages, setMessages] = useState<GroupMessage[]>([])
	const [newMessage, setNewMessage] = useState("")
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		let socket: WebSocket

		const fetchGroup = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const raw = await res.json()
				setGroup({
					id: raw.id,
					creatorId: raw.creator_id,
					creatorName: raw.creator_name, // Récupération du nom du créateur
					title: raw.title,
					description: raw.description,
					createdAt: raw.created_at,
					updatedAt: raw.updated_at,
				})
			} catch (err: any) {
				setError(err.message)
			}
		}

		const fetchMembers = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/groups/${id}/members`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const raw = await res.json()
				const mapped = raw.map((m: any) => ({
					id: m.id,
					groupId: m.group_id,
					userId: m.user_id,
					username: m.username, // Récupération du nom d'utilisateur
					accepted: m.accepted,
					createdAt: m.created_at,
				}))
				setMembers(mapped)
			} catch (err: any) {
				console.error('Error fetching members:', err.message)
			}
		}

		const fetchFollowers = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/followers`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const data = await res.json()
				setFollowers(data)
			} catch (error: any) {
				console.error('Error fetching followers :', error.message)
			}
		}

		const fetchMessages = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/groups/${id}/messages`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const data = await res.json()
				setMessages(data)
			} catch (err: any) {
				console.error('Error messages :', err.message)
			}
		}

		const initialize = async () => {
			await fetchGroup()
			await fetchMembers()
			await fetchFollowers()
			await fetchMessages()

			socket = new WebSocket(`ws://localhost:8080/ws/groups?groupId=${id}`)

			socket.onopen = () => {
				console.log('WebSocket group connected ✅')
			}

			socket.onmessage = (event) => {
				try {
					const newMsg = JSON.parse(event.data)
					setMessages((prev) => {
						const safePrev = Array.isArray(prev) ? prev : []
						if (safePrev.some(msg => msg.id === newMsg.id)) {
							return safePrev
						}
						return [...safePrev, newMsg]
					})

				} catch (err) {
					console.error('Error WebSocket group :', err)
				}
			}

			socket.onerror = (err) => {
				console.error('WebSocket error group :', err)
			}

			socket.onclose = () => {
				console.log('WebSocket group disconnected ❌')
			}
		}

		initialize()

		return () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close()
			}
		}
	}, [id])

	const sendMessage = async () => {
		if (!newMessage.trim()) return // Éviter d'envoyer des messages vides

		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ content: newMessage }),
			})
			if (!res.ok) throw new Error(await res.text())
			setNewMessage("")
		} catch (err: any) {
			console.error("Error send message :", err.message)
		}
	}

	const inviteUser = async (userIdToInvite: number) => {
		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/members`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ user_id: userIdToInvite }),
			})
			if (!res.ok) throw new Error(await res.text())
			alert(`Invitation envoyée à l'utilisateur #${userIdToInvite} !`)
			// Optionnel : rafraîchir la liste des membres après l'invitation
			// fetchMembers()
		} catch (err: any) {
			alert(`Erreur lors de l'invitation : ${err.message}`)
		}
	}

	const safeFollowers = Array.isArray(followers) ? followers : []

	if (error) return <p className="text-red-500">Error : {error}</p>
	if (!group) return <p>Loading group...</p>

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl shadow bg-white">
			<h1 className="text-2xl font-bold mb-2">{group.title}</h1>
			<p className="text-gray-600 mb-4">{group.description}</p>
			<p className="text-sm text-gray-400">
				Créé le {new Date(group.createdAt).toLocaleDateString()}
			</p>
			<p className="text-sm text-gray-400">Par {group.creatorName}</p> {/* Affichage du nom du créateur */}

			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-2">Membres du groupe :</h2>
				{members.length === 0 ? (
					<p className="text-gray-500">Aucun membre pour ce groupe.</p>
				) : (
					<ul className="list-disc list-inside space-y-1">
						{members.map((member) => (
							<li key={member.id}>
								{member.username} {/* Affichage du nom d'utilisateur */}
								<span className="text-xs text-gray-500">
									{member.accepted ? '(accepté)' : '(en attente)'}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-2">Invite user :</h2>
				{safeFollowers.length === 0 ? (
					<p className="text-gray-500">No followers</p>
				) : (
					<ul className="space-y-2">
						{safeFollowers.map((follower) => (
							<li key={follower.follower_id} className="flex justify-between items-center">
								<span>User #{follower.follower_id}</span>
								<button
									className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
									onClick={() => inviteUser(follower.follower_id)}
								>
									Inviter
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="mt-4">
				<textarea
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					className="w-full p-2 border rounded mb-2"
					placeholder="Écrire un message..."
					onKeyPress={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							sendMessage()
						}
					}}
				/>
				<button
					onClick={sendMessage}
					disabled={!newMessage.trim()}
					className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
				>
					Envoyer
				</button>
			</div>

			<div className="mt-6 border-t pt-4">
				<h2 className="text-xl font-semibold mb-2">Messages</h2>
				<div className="space-y-2 max-h-96 overflow-y-auto bg-gray-100 p-3 rounded">
					{Array.isArray(messages) && messages.length === 0 ? (
						<p className="text-gray-500 text-center">Aucun message pour le moment</p>
					) : (
						Array.isArray(messages) &&
						messages.map(msg => (
							<div key={msg.id} className="bg-white p-2 rounded shadow">
								<p className="text-sm font-semibold text-blue-600">{msg.username}</p>
								<p className="mt-1">{msg.content}</p>
								<p className="text-xs text-gray-500 mt-1">
									{new Date(msg.created_at).toLocaleTimeString()}
								</p>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}