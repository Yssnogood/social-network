type Group = {
	id: number
	creator_id: number
	creator_name: string
	title: string
	description: string
	created_at: string
	updated_at: string
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
				Créé le {new Date(group.created_at).toLocaleDateString()}
			</p>
			<p className="text-sm text-gray-400">Par {group.creator_name}</p>
		</div>
	)
}