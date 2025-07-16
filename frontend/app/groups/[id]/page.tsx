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

type GroupPost = {
	id: number
	group_id: number
	user_id: number
	username: string
	content: string
	image_path?: string
	created_at: string
	updated_at: string
	comments_count: number
}

export default function GroupPage() {
	const { id } = useParams()

	const [group, setGroup] = useState<Group | null>(null)
	const [members, setMembers] = useState<GroupMember[]>([])
	const [followers, setFollowers] = useState<Follower[]>([])
	const [messages, setMessages] = useState<GroupMessage[]>([])
	const [newMessage, setNewMessage] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [posts, setPosts] = useState<GroupPost[]>([])
	const [newPost, setNewPost] = useState("")
	const [showPosts, setShowPosts] = useState(false)
	const [isLoadingPosts, setIsLoadingPosts] = useState(false)

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

	// Fonctions pour les posts
	const fetchPosts = async () => {
		setIsLoadingPosts(true)
		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/posts`, {
				credentials: 'include',
			})
			if (!res.ok) throw new Error(await res.text())
			const data = await res.json()
			setPosts(Array.isArray(data) ? data : [])
		} catch (err: any) {
			console.error('Error fetching posts:', err.message)
		} finally {
			setIsLoadingPosts(false)
		}
	}

	const createPost = async () => {
		if (!newPost.trim()) return

		try {
			const res = await fetch(`http://localhost:8080/api/groups/${id}/posts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					group_id: parseInt(id as string),
					content: newPost
				}),
			})
			if (!res.ok) throw new Error(await res.text())

			setNewPost("")
			// Recharger les posts après création
			await fetchPosts()
		} catch (err: any) {
			console.error('Error creating post:', err.message)
			alert(`Erreur lors de la création du post : ${err.message}`)
		}
	}

	const togglePosts = async () => {
		if (!showPosts) {
			await fetchPosts()
		}
		setShowPosts(!showPosts)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
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

			{/* Navigation entre Messages et Posts */}
			<div className="flex gap-4 mb-4 border-b">
				<button
					onClick={() => setShowPosts(false)}
					className={`pb-2 px-4 font-medium ${!showPosts
						? 'text-blue-600 border-b-2 border-blue-600'
						: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Messages
				</button>
				<button
					onClick={togglePosts}
					className={`pb-2 px-4 font-medium ${showPosts
						? 'text-blue-600 border-b-2 border-blue-600'
						: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Posts
				</button>
			</div>

			{/* Section Messages */}
			{!showPosts && (
				<>
					<MessageInput
						value={newMessage}
						onChange={setNewMessage}
						onSend={sendMessage}
					/>
					<MessagesList messages={messages} />
				</>
			)}

			{/* Section Posts */}
			{showPosts && (
				<div className="space-y-4">
					{/* Créer un nouveau post */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Créer un post</h3>
						<textarea
							value={newPost}
							onChange={(e) => setNewPost(e.target.value)}
							placeholder="Écrivez votre post..."
							className="w-full p-2 border rounded-md resize-none"
							rows={3}
						/>
						<button
							onClick={createPost}
							disabled={!newPost.trim()}
							className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
						>
							Publier
						</button>
					</div>

					{/* Liste des posts */}
					<div className="space-y-3">
						<h3 className="font-semibold">Posts du groupe</h3>

						{isLoadingPosts && (
							<div className="text-center py-4">
								<p className="text-gray-500">Chargement des posts...</p>
							</div>
						)}

						{!isLoadingPosts && Array.isArray(posts) && posts.length === 0 && (
							<div className="text-center py-8 text-gray-500">
								<p>Aucun post dans ce groupe pour le moment.</p>
								<p className="text-sm">Soyez le premier à publier quelque chose !</p>
							</div>
						)}

						{posts.map((post) => (
							<div key={post.id} className="bg-white border rounded-lg p-4 shadow-sm">
								<div className="flex justify-between items-start mb-2">
									<div>
										<span className="font-medium text-blue-600">
											{post.username}
										</span>
										<span className="text-sm text-gray-500 ml-2">
											{formatDate(post.created_at)}
										</span>
									</div>
									{post.comments_count > 0 && (
										<span className="text-sm text-gray-500">
											{post.comments_count} commentaire{post.comments_count > 1 ? 's' : ''}
										</span>
									)}
								</div>

								<div className="text-gray-800 whitespace-pre-wrap">
									{post.content}
								</div>

								{post.image_path && (
									<div className="mt-3">
										<img
											src={post.image_path}
											alt="Post image"
											className="max-w-full h-auto rounded-md"
										/>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}