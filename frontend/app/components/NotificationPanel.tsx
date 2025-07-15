'use client';

export default function Notifications({ notifications }: { notifications: string[] }) {
    return (
        <div className="absolute top-10 right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50">
            <ul className="divide-y divide-gray-200 text-sm text-gray-800">
                {notifications.length === 0 ? (
                    <li className="p-3 text-gray-500 text-center">Aucune notification</li>
                ) : (
                    notifications.map((note, index) => (
                        <li key={index} className="p-3 hover:bg-gray-100 transition">
                            {note}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
