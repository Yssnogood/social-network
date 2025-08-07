'use client';

import { useState } from 'react';
import { GroupCreationData } from '../CreationContentPanel';

interface GroupConfigPanelProps {
    data: GroupCreationData;
    onChange: (data: GroupCreationData) => void;
    disabled?: boolean;
    availableParentGroups?: Array<{ id: number; title: string; }>;
}

export default function GroupConfigPanel({ 
    data, 
    onChange, 
    disabled = false,
    availableParentGroups = []
}: GroupConfigPanelProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleInputChange = (field: keyof GroupCreationData, value: any) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // TODO: Implémenter le service d'upload
            // Pour l'instant, on simule avec une URL temporaire
            const imageUrl = URL.createObjectURL(file);
            handleInputChange('imageUrl', imageUrl);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            // TODO: Implémenter le service d'upload
            const imageUrl = URL.createObjectURL(file);
            handleInputChange('imageUrl', imageUrl);
        }
    };

    const removeImage = () => {
        handleInputChange('imageUrl', undefined);
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-white">Nouveau Groupe</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Configurez votre groupe et invitez des membres
                </p>
            </div>

            {/* Image du groupe */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                    Image du groupe (optionnel)
                </label>
                
                {data.imageUrl ? (
                    <div className="relative">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                            <img 
                                src={data.imageUrl} 
                                alt="Aperçu du groupe"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={removeImage}
                            disabled={disabled}
                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
                            title="Supprimer l'image"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                            isDragging 
                                ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                                : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-400 text-center mb-2">
                            Glissez-déposez une image ici
                        </p>
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                            Choisir un fichier
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={disabled}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Titre du groupe */}
            <div className="space-y-2">
                <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-300">
                    Nom du groupe *
                </label>
                <input
                    type="text"
                    id="groupTitle"
                    value={data.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Amis de l'université, Club de lecture..."
                    disabled={disabled}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    maxLength={100}
                />
                <div className="text-xs text-gray-500 text-right">
                    {data.title.length}/100
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="groupDescription"
                    value={data.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre groupe, son objectif, ses règles..."
                    disabled={disabled}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                    {data.description.length}/500
                </div>
            </div>

            {/* Groupe parent (hiérarchie) */}
            {availableParentGroups.length > 0 && (
                <div className="space-y-2">
                    <label htmlFor="parentGroup" className="block text-sm font-medium text-gray-300">
                        Groupe parent (optionnel)
                    </label>
                    <select
                        id="parentGroup"
                        value={data.parentGroupId || ''}
                        onChange={(e) => handleInputChange('parentGroupId', e.target.value ? parseInt(e.target.value) : undefined)}
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="">Aucun groupe parent</option>
                        {availableParentGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.title}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">
                        Les sous-groupes héritent des membres du groupe parent
                    </p>
                </div>
            )}

            {/* Confidentialité */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                    Confidentialité
                </label>
                <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="privacy"
                            checked={!data.isPrivate}
                            onChange={() => handleInputChange('isPrivate', false)}
                            disabled={disabled}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        />
                        <div>
                            <div className="text-white font-medium">Public</div>
                            <div className="text-gray-400 text-xs">
                                Tout le monde peut voir le groupe et ses contenus
                            </div>
                        </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="privacy"
                            checked={data.isPrivate}
                            onChange={() => handleInputChange('isPrivate', true)}
                            disabled={disabled}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        />
                        <div>
                            <div className="text-white font-medium">Privé</div>
                            <div className="text-gray-400 text-xs">
                                Seuls les membres peuvent voir le groupe et ses contenus
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Validation */}
            <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                        data.title.trim().length > 0 ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className={data.title.trim().length > 0 ? 'text-green-400' : 'text-gray-400'}>
                        Nom du groupe requis
                    </span>
                </div>
            </div>
        </div>
    );
}