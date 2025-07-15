'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GroupHeader from '../../components/groupComponent/GroupHeader'
import MembersList from '../../components/groupComponent/MembersList'
import UserInvitation from '../../components/groupComponent/UserInvitation'
import MessageInput from '../../components/groupComponent/MessageInput'
import MessagesList from '../../components/groupComponent/MessagesList'

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
					creatorName: raw.creator_name,
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
					username: m.username,
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
		if (!newMessage.trim()) return

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
		} catch (err: any) {
			alert(`Erreur lors de l'invitation : ${err.message}`)
		}
	}

	if (error) return <p className="text-red-500">Error : {error}</p>
	if (!group) return <p>Loading group...</p>

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl shadow bg-white">
			<GroupHeader group={group} />
			<MembersList members={members} />
			<UserInvitation
				followers={followers}
				onInvite={inviteUser}
			/>
			<MessageInput
				value={newMessage}
				onChange={setNewMessage}
				onSend={sendMessage}
			/>
			<MessagesList messages={messages} />
		</div>
	)
}