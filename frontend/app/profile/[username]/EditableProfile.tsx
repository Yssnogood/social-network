import React, { useState } from 'react';
import { url } from "@/lib/config";
import { CldUploadButton } from 'next-cloudinary';

interface EditableProfileProps {
  profile: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    about_me: string;
    is_public: boolean;
    birth_date: string;
    avatar_path?: string;
  };
  onSave: () => void;
  setAvatarPath: (url: string) => void;
  setAboutMeText: (about: string) => void;
  setIsPublic: (value: boolean) => void;
}

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

const EditableProfile: React.FC<EditableProfileProps> = ({
  profile,
  onSave,
  setAvatarPath,
  setAboutMeText
}) => {
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [imageURL, setPostImage] = useState<string>(profile.avatar_path || '');
  const [isPublic, setIsPublic] = useState<boolean>(profile.is_public);
  const [isSaving, setIsSaving] = useState(false);
  

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(url + `/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          about_me: aboutMe,
          is_public: isPublic,
          birth_date: profile.birth_date,
          avatar_path: imageURL,
          password: '',
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      setAvatarPath(imageURL);
      setAboutMeText(aboutMe);
      setIsPublic(isPublic);
      onSave();
    } catch (err) {
      console.error('Erreur :', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Avatar & Name */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="flex-shrink-0">
          {imageURL && (
            <img
              src={imageURL}
              alt="Avatar"
              className="w-[150px] h-[150px] rounded-full object-cover border-4 border-blue-100"
            />
          )}
          <CldUploadButton
            options={{ sources: ['local', 'url'] }}
            uploadPreset={cloudPresetName}
            onSuccess={(result) => {
              if (result.info && typeof result.info !== 'string') {
                setPostImage(result.info.secure_url);
              }
            }}
          >
            <span className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block cursor-pointer">
              Changer l’image
            </span>
          </CldUploadButton>
        </div>

        <div className="flex flex-col mt-4 md:mt-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.username}
          </h1>
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mt-2">
            {profile.first_name} {profile.last_name}
          </h2>
        </div>
      </div>

      {/* More Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {/* À propos de moi */}
        <div className="mb-4">
          <label className="text-lg font-semibold mb-2 text-gray-900 dark:text-white block">
            À propos de moi
          </label>
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white"
            rows={4}
          />
        </div>

        {/* Toggle Public/Privé */}
        <div className="mb-6">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-white">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            Profil {isPublic ? "Public" : "Privé"}
          </label>
        </div>

        {/* Bouton Sauvegarder */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </>
  );
};

export default EditableProfile;
