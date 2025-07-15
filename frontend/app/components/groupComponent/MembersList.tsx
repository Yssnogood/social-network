type GroupMember = {
	id: number
	groupId: number
	userId: number
	username: string
	accepted: boolean
	createdAt: string
}

interface MembersListProps {
	members: GroupMember[]
}

export default function MembersList({ members }: MembersListProps) {
	return (
		<div className="mt-6">
			<h2 className="text-xl font-semibold mb-2">Membres du groupe :</h2>
			{members.length === 0 ? (
				<p className="text-gray-500">Aucun membre pour ce groupe.</p>
			) : (
				<ul className="list-disc list-inside space-y-1">
					{members.map((member) => (
						<li key={member.id}>
							{member.username}
							<span className="text-xs text-gray-500 ml-2">
								{member.accepted ? '(accepté)' : '(en attente)'}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}