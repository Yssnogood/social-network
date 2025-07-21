import { acceptFriendRequestNotif, declineFriendRequestNotif } from "../../services/notifications";

export default function Notifications({ notifications }: { notifications: any[] }) {
    return (
        <div className="absolute top-10 right-0 mt-2 w-72 bg-white shadow-lg rounded-lg z-50">
            <ul className="divide-y divide-gray-200 text-sm text-gray-800">
                {notifications.length === 0 ? (
                    <li className="p-3 text-gray-500 text-center">Aucune notification</li>
                ) : (
                    notifications.map((notif, index) => (
                        <li key={index} className="p-3 hover:bg-gray-100 transition">
                            <p>{notif.content}</p>
                            {notif.type === "follow_request" && (
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => acceptFriendRequestNotif(notif.id, notif.user_id, notif.reference_id)}
                                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => declineFriendRequestNotif(notif.id, notif.user_id, notif.reference_id)}
                                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
