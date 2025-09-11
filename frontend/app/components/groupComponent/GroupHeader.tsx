import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, User } from "lucide-react";

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
		<Card className="border-zinc-800 bg-zinc-900 mb-6">
			<CardHeader>
				<div className="flex items-start space-x-4">
					<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
						<Users size={32} className="text-white" />
					</div>
					<div className="flex-1">
						<CardTitle className="text-2xl text-white mb-2">{group.title}</CardTitle>
						<CardDescription className="text-zinc-300 text-base mb-4">
							{group.description}
						</CardDescription>
						<div className="flex items-center space-x-6 text-sm text-zinc-400">
							<div className="flex items-center space-x-1">
								<Calendar size={16} />
								<span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
							</div>
							<div className="flex items-center space-x-1">
								<User size={16} />
								<span>By {group.creatorName}</span>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
		</Card>
	)
}