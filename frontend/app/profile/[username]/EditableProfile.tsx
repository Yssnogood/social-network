import React, { useState } from 'react';
import { url } from "../../login/page";
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
          is_public: profile.is_public,
          birth_date: profile.birth_date,
          avatar_path: imageURL,
          password: '',
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      // MAJ visuelle dans le parent
      setAvatarPath(imageURL);
      setAboutMeText(aboutMe);

      onSave();
    } catch (err) {
      console.error('Erreur :', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Top section - Avatar & Infos */}
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
            <span className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              Change Image
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

      {/* More Info Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">

        {/* À propos de moi */}
        <div className="mb-4">
          <label className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            À propos de moi
          </label>
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white"
            rows={4}
          />
        </div>

        {/* Sauvegarder */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </>
  );
};

export default EditableProfile;
