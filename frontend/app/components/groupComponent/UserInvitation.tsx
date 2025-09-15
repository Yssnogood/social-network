import { FollowerUser } from "../../../services/follow";
import { GroupMember } from "../../types/group";

interface UserInvitationProps {
	followers: FollowerUser[]
	members: GroupMember[]
	onInvite: (userId: number) => void
}

export default function UserInvitation({ followers, members, onInvite }: UserInvitationProps) {
	const safeFollowers = Array.isArray(followers) ? followers : []
	const safeMembers = Array.isArray(members) ? members : []

	// Filter out users who are already members of the group
	const availableFollowers = safeFollowers.filter(follower => 
		!safeMembers.some(member => member.userId === follower.id)
	)

	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold mb-4 text-white">Invite user :</h2>
			{availableFollowers.length === 0 ? (
				<p className="text-zinc-400">No followers available to invite</p>
			) : (
				<ul className="space-y-2">
					{availableFollowers.map((follower) => (
						<li key={follower.id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg border border-zinc-700">
							<div className="flex items-center gap-3">
								<img
									src={follower.avatar_path || "/defaultPP.webp"}
									alt={`${follower.username}'s avatar`}
									className="w-10 h-10 rounded-full object-cover border border-zinc-600"
								/>
								<span className="text-zinc-100 font-medium">{follower.username}</span>
							</div>
							<button
								className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
								onClick={() => onInvite(follower.id)}
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