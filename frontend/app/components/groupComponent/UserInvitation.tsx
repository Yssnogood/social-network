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