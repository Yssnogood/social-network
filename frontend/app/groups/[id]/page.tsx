'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Group = {
	id: number
	creatorId: number
	title: string
	description: string
	createdAt: string
	updatedAt: string
}

type GroupMember = {
	id: number
	groupId: number
	userId: number
	accepted: boolean
	createdAt: string
}

interface Follower {
	follower_id: number
	followed_id: number
	accepted: boolean
	followed_at: string
}

export default function GroupPage() {
	const { id } = useParams()
	const [group, setGroup] = useState<Group | null>(null)
	const [members, setMembers] = useState<GroupMember[]>([])
	const [followers, setFollowers] = useState<Follower[]>([])
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		const initialize = async () => {
			await fetchGroup()
			await fetchMembers()
			await fetchFollowers()
		}

		// Récupération du groupe
		const fetchGroup = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const raw = await res.json()
				const data: Group = {
					id: raw.id,
					creatorId: raw.creator_id,
					title: raw.title,
					description: raw.description,
					createdAt: raw.created_at,
					updatedAt: raw.updated_at,
				}
				setGroup(data)
			} catch (err: any) {
				setError(err.message)
			}
		}

		// Récupération des membres
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
					accepted: m.accepted,
					createdAt: m.created_at,
				}))
				setMembers(mapped)
			} catch (err: any) {
				console.error('Error fetching members:', err.message)
			}
		}

		// Récupération des followers
		const fetchFollowers = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/followers`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const data = await res.json()
				setFollowers(data)
			} catch (error: any) {
				console.error('Erreur lors du fetch des followers :', error.message)
			}
		}

		initialize()
	}, [id])

	// Fonction pour inviter un utilisateur
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

	if (error) return <p className="text-red-500">Erreur : {error}</p>
	if (!group) return <p>Chargement du groupe...</p>

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl shadow bg-white">
			<h1 className="text-2xl font-bold mb-2">{group.title}</h1>
			<p className="text-gray-600 mb-4">{group.description}</p>
			<p className="text-sm text-gray-400">
				Créé le {new Date(group.createdAt).toLocaleDateString()}
			</p>
			<p className="text-sm text-gray-400">Par utilisateur #{group.creatorId}</p>

			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-2">Membres du groupe :</h2>
				{members.length === 0 ? (
					<p className="text-gray-500">Aucun membre pour ce groupe.</p>
				) : (
					<ul className="list-disc list-inside space-y-1">
						{members.map((member) => (
							<li key={member.id}>
								Utilisateur #{member.userId}{' '}
								<span className="text-xs text-gray-500">
									{member.accepted ? '(accepté)' : '(en attente)'}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-2">Inviter un utilisateur :</h2>
				{followers.length === 0 ? (
					<p className="text-gray-500">Aucun follower disponible pour invitation.</p>
				) : (
					<ul className="space-y-2">
						{followers.map((follower) => (
							<li key={follower.follower_id} className="flex justify-between items-center">
								<span>Utilisateur #{follower.follower_id}</span>
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
		</div>
	)
}
