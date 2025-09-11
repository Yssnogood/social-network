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
			<h2 className="text-xl font-semibold mb-4 text-white">Membres du groupe :</h2>
			{members.length === 0 ? (
				<p className="text-zinc-400">Aucun membre pour ce groupe.</p>
			) : (
				<ul className="space-y-2">
					{members.map((member) => (
						<li key={member.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg border border-zinc-700">
							<span className="text-zinc-100">{member.username}</span>
							<span className={`text-xs px-2 py-1 rounded ${
								member.accepted 
									? 'bg-green-600/20 text-green-400 border border-green-600/30' 
									: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
							}`}>
								{member.accepted ? 'accepté' : 'en attente'}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}