import { FollowerUser } from "../../../services/follow";
import { GroupMember } from "../../types/group";
import { useState, useEffect } from "react";
import { checkGroupInvitationStatus } from "../../../services/group";

interface UserInvitationProps {
	followers: FollowerUser[]
	members: GroupMember[]
	onInvite: (userId: number) => void
	groupId?: number
}

interface UserInvitationStatus {
	[userId: number]: {
		hasPendingInvitation: boolean
		isMember: boolean
	}
}

export default function UserInvitation({ followers, members, onInvite, groupId }: UserInvitationProps) {
	const safeFollowers = Array.isArray(followers) ? followers : []
	const safeMembers = Array.isArray(members) ? members : []
	const [invitationStatuses, setInvitationStatuses] = useState<UserInvitationStatus>({})
	const [loading, setLoading] = useState(true)

	// Filter out users who are already members of the group
	const availableFollowers = safeFollowers.filter(follower => 
		!safeMembers.some(member => member.userId === follower.id)
	)

	useEffect(() => {
		async function fetchInvitationStatuses() {
			if (!groupId || availableFollowers.length === 0) {
				setLoading(false)
				return
			}

			const statuses: UserInvitationStatus = {}
			
			try {
				await Promise.all(
					availableFollowers.map(async (follower) => {
						try {
							const status = await checkGroupInvitationStatus(groupId, follower.id)
							statuses[follower.id] = status
						} catch (error) {
							console.error(`Error checking invitation status for user ${follower.id}:`, error)
							// Default to allowing invitation if check fails
							statuses[follower.id] = { hasPendingInvitation: false, isMember: false }
						}
					})
				)
			} catch (error) {
				console.error("Error fetching invitation statuses:", error)
			}

			setInvitationStatuses(statuses)
			setLoading(false)
		}

		fetchInvitationStatuses()
	}, [groupId, availableFollowers.length])

	const handleInvite = (userId: number) => {
		onInvite(userId)
		// Update local state to show invitation as pending
		setInvitationStatuses(prev => ({
			...prev,
			[userId]: { ...prev[userId], hasPendingInvitation: true }
		}))
	}

	if (loading) {
		return (
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4 text-white">Invite user :</h2>
				<p className="text-zinc-400">Loading...</p>
			</div>
		)
	}

	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold mb-4 text-white">Invite user :</h2>
			{availableFollowers.length === 0 ? (
				<p className="text-zinc-400">No followers available to invite</p>
			) : (
				<ul className="space-y-2">
					{availableFollowers.map((follower) => {
						const status = invitationStatuses[follower.id]
						const hasPendingInvitation = status?.hasPendingInvitation || false
						
						return (
							<li key={follower.id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg border border-zinc-700">
								<div className="flex items-center gap-3">
									<img
										src={follower.avatar_path || "/defaultPP.webp"}
										alt={`${follower.username}'s avatar`}
										className="w-10 h-10 rounded-full object-cover border border-zinc-600"
									/>
									<span className="text-zinc-100 font-medium">{follower.username}</span>
								</div>
								{hasPendingInvitation ? (
									<span className="text-yellow-400 px-3 py-1 text-sm font-medium">
										Invitation envoyée
									</span>
								) : (
									<button
										className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
										onClick={() => handleInvite(follower.id)}
									>
										Inviter
									</button>
								)}
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}