'use client';

import { useState } from 'react';
import { EventCreationData } from '../CreationContentPanel';

interface EventConfigPanelProps {
    data: EventCreationData;
    onChange: (data: EventCreationData) => void;
    disabled?: boolean;
    groupName?: string; // Nom du groupe parent
}

export default function EventConfigPanel({ 
    data, 
    onChange, 
    disabled = false,
    groupName
}: EventConfigPanelProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleInputChange = (field: keyof EventCreationData, value: any) => {
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

    // Fonction pour formater la date pour l'input datetime-local
    const formatDateForInput = (isoString: string): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    };

    // Fonction pour convertir la date de l'input en ISO string
    const handleDateChange = (value: string) => {
        if (value) {
            const date = new Date(value);
            handleInputChange('eventDate', date.toISOString());
        } else {
            handleInputChange('eventDate', '');
        }
    };

    // Validation de la date (pas dans le passé)
    const isDateValid = () => {
        if (!data.eventDate) return false;
        return new Date(data.eventDate) > new Date();
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-white">Nouvel Événement</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {groupName ? `Créer un événement pour ${groupName}` : 'Configurez votre événement et invitez des participants'}
                </p>
            </div>

            {/* Image de l'événement */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                    Image de l'événement (optionnel)
                </label>
                
                {data.imageUrl ? (
                    <div className="relative">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                            <img 
                                src={data.imageUrl} 
                                alt="Aperçu de l'événement"
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

            {/* Titre de l'événement */}
            <div className="space-y-2">
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-300">
                    Nom de l'événement *
                </label>
                <input
                    type="text"
                    id="eventTitle"
                    value={data.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Soirée jeux, Conférence tech, Barbecue..."
                    disabled={disabled}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    maxLength={100}
                />
                <div className="text-xs text-gray-500 text-right">
                    {data.title.length}/100
                </div>
            </div>

            {/* Date et heure */}
            <div className="space-y-2">
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300">
                    Date et heure *
                </label>
                <input
                    type="datetime-local"
                    id="eventDate"
                    value={formatDateForInput(data.eventDate)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                        data.eventDate && !isDateValid() 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-600 focus:ring-blue-500'
                    }`}
                />
                {data.eventDate && !isDateValid() && (
                    <p className="text-red-400 text-xs">
                        La date doit être dans le futur
                    </p>
                )}
            </div>

            {/* Lieu */}
            <div className="space-y-2">
                <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-300">
                    Lieu (optionnel)
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="eventLocation"
                        value={data.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Ex: Restaurant Le Gourmet, Parc de la ville, En ligne..."
                        disabled={disabled}
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        maxLength={200}
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                {data.location && (
                    <div className="text-xs text-gray-500 text-right">
                        {data.location.length}/200
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="eventDescription"
                    value={data.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre événement, son objectif, ce qui sera fourni..."
                    disabled={disabled}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                    {data.description.length}/500
                </div>
            </div>

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
                                Tous les membres du groupe peuvent voir l'événement
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
                                Seuls les participants invités peuvent voir l'événement
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Validation */}
            <div className="pt-4 border-t border-gray-700 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                        data.title.trim().length > 0 ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className={data.title.trim().length > 0 ? 'text-green-400' : 'text-gray-400'}>
                        Nom de l'événement requis
                    </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                        isDateValid() ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className={isDateValid() ? 'text-green-400' : 'text-gray-400'}>
                        Date future requise
                    </span>
                </div>
            </div>
        </div>
    );
}