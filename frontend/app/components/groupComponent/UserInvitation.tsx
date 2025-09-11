interface Follower {
	follower_id: number
	followed_id: number
	accepted: boolean
	followed_at: string
}

interface UserInvitationProps {
	followers: Follower[]
	onInvite: (userId: number) => void
}

export default function UserInvitation({ followers, onInvite }: UserInvitationProps) {
	const safeFollowers = Array.isArray(followers) ? followers : []

	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold mb-4 text-white">Invite user :</h2>
			{safeFollowers.length === 0 ? (
				<p className="text-zinc-400">No followers</p>
			) : (
				<ul className="space-y-2">
					{safeFollowers.map((follower) => (
						<li key={follower.follower_id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg border border-zinc-700">
							<span className="text-zinc-100">User #{follower.follower_id}</span>
							<button
								className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
								onClick={() => onInvite(follower.follower_id)}
							>
								Inviter
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}