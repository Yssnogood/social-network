type Group = {
	id: number
	creatorId: number
	creatorName: string
	title: string
	description: string
	createdAt: string
	updatedAt: string
}

interface GroupHeaderProps {
	group: Group
}

export default function GroupHeader({ group }: GroupHeaderProps) {
	return (
		<div className="mb-6">
			<h1 className="text-2xl font-bold mb-2">{group.title}</h1>
			<p className="text-gray-600 mb-4">{group.description}</p>
			<p className="text-sm text-gray-400">
				Créé le {new Date(group.createdAt).toLocaleDateString()}
			</p>
			<p className="text-sm text-gray-400">Par {group.creatorName}</p>
		</div>
	)
}