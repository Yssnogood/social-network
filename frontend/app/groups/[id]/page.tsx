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

export default function GroupPage() {
	const { id } = useParams()
	const [group, setGroup] = useState<Group | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		const fetchGroup = async () => {
			try {
				const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
					credentials: 'include',
				})
				if (!res.ok) throw new Error(await res.text())
				const data = await res.json()
				setGroup(data)
			} catch (err: any) {
				setError(err.message)
			}
		}

		fetchGroup()
	}, [id])

	if (error) return <p className="text-red-500">Erreur : {error}</p>
	if (!group) return <p>Chargement du groupe...</p>

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl shadow bg-white">
			<h1 className="text-2xl font-bold mb-2">{group.title}</h1>
			<p className="text-gray-600 mb-4">{group.description}</p>
			<p className="text-sm text-gray-400">Créé le {new Date(group.createdAt).toLocaleDateString()}</p>
			<p className="text-sm text-gray-400">Par utilisateur #{group.creatorId}</p>
		</div>
	)
}
