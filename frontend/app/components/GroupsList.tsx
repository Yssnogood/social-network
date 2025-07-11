import Link from "next/link";

interface Group {
    id: number;
    title: string;
}

interface GroupsListProps {
    groups: Group[];
}

export default function GroupsList({ groups }: GroupsListProps) {
    if (!Array.isArray(groups) || groups.length === 0) {
        return null;
    }

    return (
        <div className="fixed right-5 top-1/3 transform -translate-y-1/2 bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-40">
            {groups.map((group: Group) => (
                <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow"
                >
                    {group.title}
                </Link>
            ))}
        </div>
    );
} 