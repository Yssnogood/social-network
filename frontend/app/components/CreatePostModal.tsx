import { useState, use, useEffect } from "react";
import { CldUploadButton } from "next-cloudinary";
import { MultiSelect } from "./MultiSelect";
import { fetchFriends } from "@/services/contact";

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (postData: { content: string; privacy: number; viewers: number[]; imageUrl?: string }) => void;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
    const [postPrivacy, setPostPrivacy] = useState(0);
    const [postContent, setPostContent] = useState('');
    const [imageURL, setPostImage] = useState<string>('');
    const [friends,setFriends] = useState<any[]>([]);
    const [selectedFriends,setSelectedFriends] = useState<any[]>([]);
    
    useEffect(() => {
        if (!isOpen) return
        fetchFriends().then((data) => setFriends(data))
    },[isOpen])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl;
        if (imageURL !== '') {
            imageUrl = imageURL;
        }
        let viewers: number[] = [];
        if (postPrivacy == 2) {
            viewers = friends.map((friend) => friend.id)
            console.log(viewers,postPrivacy)
        }
        onSubmit({
            content: postContent,
            privacy: postPrivacy,
            viewers,
            imageUrl
        });

        // Reset form
        setPostPrivacy(0);
        setPostContent('');
        setPostImage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Create a Post</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="postPrivacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy</label>
                        <select
                            name="postPrivacy"
                            id="postPrivacy"
                            value={postPrivacy}
                            onChange={(e) => setPostPrivacy(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            <option value="0">🌍 Public</option>
                            <option value="1">🙎‍♂️ Friends</option>
                            <option value="2">🔒 Private</option>
                        </select>
                        
                        {postPrivacy === 2 && <MultiSelect options={friends} selected={selectedFriends} onChange={setSelectedFriends} placeholder="Select who can see your post !" />}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="postContent" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                        <textarea
                            id="postContent"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <CldUploadButton
                            options={{ sources: ['local', 'url'] }}
                            uploadPreset={cloudPresetName}
                            onSuccess={(result) => {
                                if (result.info && typeof result.info !== "string") {
                                    setPostImage(result.info.secure_url);
                                }
                            }}
                        >
                            <span>Upload Image</span>
                        </CldUploadButton>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 