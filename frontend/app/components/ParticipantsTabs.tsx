'use client';

import { useState } from 'react';

interface ParticipantsTabsProps {
  // Pour les événements
  responses?: Array<{
    id: number;
    user_id: number;
    username: string;
    status: 'going' | 'not_going' | 'maybe' | 'invited';
  }>;
  
  // Pour les groupes
  members?: Array<{
    id: number;
    userId: number;
    username: string;
    accepted: boolean;
  }>;
  
  // Mode d'affichage
  mode: 'event' | 'group';
}

export default function ParticipantsTabs({ responses = [], members = [], mode }: ParticipantsTabsProps) {
  const [activeTab, setActiveTab] = useState<'participants' | 'maybe' | 'declined' | 'pending'>('participants');

  // Fonction pour obtenir les données selon le mode et l'onglet
  const getTabData = (tab: string) => {
    if (mode === 'event') {
      switch (tab) {
        case 'participants':
          return responses.filter(r => r.status === 'going');
        case 'maybe':
          return responses.filter(r => r.status === 'maybe');
        case 'declined':
          return responses.filter(r => r.status === 'not_going');
        case 'pending':
          return responses.filter(r => r.status === 'invited');
        default:
          return [];
      }
    } else {
      // Mode group
      switch (tab) {
        case 'participants':
          return members.filter(m => m.accepted);
        case 'pending':
          return members.filter(m => !m.accepted);
        default:
          return [];
      }
    }
  };

  // Compteurs pour les badges
  const participantsCount = getTabData('participants').length;
  const maybeCount = mode === 'event' ? getTabData('maybe').length : 0;
  const declinedCount = mode === 'event' ? getTabData('declined').length : 0;
  const pendingCount = getTabData('pending').length;

  // Configuration des onglets selon le mode
  const tabs = mode === 'event' 
    ? [
        { id: 'participants', label: 'Participants', count: participantsCount, color: 'green' },
        { id: 'maybe', label: 'Peut-être', count: maybeCount, color: 'amber' },
        { id: 'declined', label: 'Absents', count: declinedCount, color: 'red' },
        { id: 'pending', label: 'Invités en attente', count: pendingCount, color: 'blue' }
      ]
    : [
        { id: 'participants', label: 'Membres', count: participantsCount, color: 'green' },
        { id: 'pending', label: 'Invités en attente', count: pendingCount, color: 'blue' }
      ];

  const activeData = getTabData(activeTab);

  // Fonction pour obtenir l'avatar et le nom selon le mode
  const getUserDisplay = (item: any) => {
    if (mode === 'event') {
      return {
        username: item.username,
        initial: item.username.charAt(0).toUpperCase(),
        status: item.status
      };
    } else {
      return {
        username: item.username,
        initial: item.username.charAt(0).toUpperCase(),
        status: item.accepted ? 'member' : 'pending'
      };
    }
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (item: any) => {
    if (mode === 'event') {
      switch (item.status) {
        case 'going':
          return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Participe</span>;
        case 'maybe':
          return <span className="px-2 py-1 bg-amber-600 text-white text-xs rounded-full">Peut-être</span>;
        case 'not_going':
          return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Absent</span>;
        case 'invited':
          return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">⏳ Invité</span>;
        default:
          return null;
      }
    } else {
      return item.accepted 
        ? <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Membre</span>
        : <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">⏳ En attente</span>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        {mode === 'event' ? 'Participants à l\'événement' : 'Membres du groupe'}
      </h3>

      {/* Navigation des onglets */}
      <div className="border-b border-gray-700 mb-4">
        <nav className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  tab.color === 'green' ? 'bg-green-600 text-white' :
                  tab.color === 'amber' ? 'bg-amber-600 text-white' :
                  tab.color === 'red' ? 'bg-red-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="space-y-3">
        {activeData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3 opacity-50">
              {activeTab === 'pending' ? '⏳' : 
               activeTab === 'participants' ? '👥' :
               activeTab === 'maybe' ? '🤔' : '❌'}
            </div>
            <p className="text-sm">
              {activeTab === 'pending' ? 'Aucune invitation en attente' :
               activeTab === 'participants' ? (mode === 'event' ? 'Aucun participant' : 'Aucun membre') :
               activeTab === 'maybe' ? 'Personne n\'a répondu "peut-être"' :
               'Personne n\'a décliné'}
            </p>
          </div>
        ) : (
          activeData.map((item: any, index: number) => {
            const userDisplay = getUserDisplay(item);
            return (
              <div 
                key={`${mode}-${item.id || item.userId}-${index}`}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                    {userDisplay.initial}
                  </div>
                  
                  {/* Nom utilisateur */}
                  <div>
                    <span className="text-white font-medium">{userDisplay.username}</span>
                    {activeTab === 'pending' && (
                      <p className="text-xs text-gray-400 mt-1">
                        {mode === 'event' ? 'Invitation envoyée' : 'Demande d\'adhésion en cours'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Badge de statut */}
                <div>
                  {getStatusBadge(item)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}