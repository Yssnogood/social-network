graph TB
    %% Système de Messagerie en haut
    subgraph MS["SYSTÈME DE MESSAGERIE INSTANTANÉE"]
        MS1("Démarrer conversation")
        MS2("Créer chat de groupe")
        MS3("Envoyer message")
        MS4("Répondre à message")
        MS5("Envoyer médias")
        MS6("Voir qui écrit")
        MS7("Envoyer emojis")
        MS8("Statut en ligne")
        MS9("Accusés de lecture")
    end
    
    %% Acteurs au centre
    GuestUser{"Utilisateur non connecté"}
    AuthUser{"Utilisateur connecté"}
    GroupMember{"Membre du groupe"}
    GroupCreator{"Créateur du groupe"}
    
    %% Application Electron à droite
    subgraph EL["APPLICATION ELECTRON"]
        E1("Mode hors ligne")
        E2("Recherche messages")
        E3("Notifications système")
        E4("Synchronisation")
    end
    
    %% Système de Publications en bas
    subgraph PS["SYSTÈME DE PUBLICATIONS"]
        PS1("S'inscrire")
        PS2("Se connecter")
        PS3("Se déconnecter")
        PS4("Gérer profil")
        PS5("Visibilité profil")
        PS6("Créer publication")
        PS7("Commenter")
        PS8("Confidentialité")
        PS9("Suivre utilisateur")
        PS10("Gérer abonnements")
        PS11("Créer groupe")
        PS12("Rejoindre groupe")
        PS13("Inviter membres")
        PS14("Gérer demandes")
        PS15("Créer événement")
        PS16("Répondre événement")
        PS17("Notifications")
    end
    
    %% Connexions
    %% Guest User
    GuestUser --> PS1
    GuestUser --> PS2
    
    %% Auth User to Publications
    AuthUser --> PS3
    AuthUser --> PS4
    AuthUser --> PS5
    AuthUser --> PS6
    AuthUser --> PS7
    AuthUser --> PS8
    AuthUser --> PS9
    AuthUser --> PS10
    AuthUser --> PS11
    AuthUser --> PS12
    AuthUser --> PS17
    
    %% Auth User to Messaging
    AuthUser --> MS1
    AuthUser --> MS2
    AuthUser --> MS3
    AuthUser --> MS4
    AuthUser --> MS5
    AuthUser --> MS6
    AuthUser --> MS7
    AuthUser --> MS8
    AuthUser --> MS9
    
    %% Auth User to Electron
    AuthUser --> E1
    AuthUser --> E2
    AuthUser --> E3
    AuthUser --> E4
    
    %% Group Member
    GroupMember --> PS13
    GroupMember --> PS16
    
    %% Group Creator
    GroupCreator --> PS14
    GroupCreator --> PS15
    
    %% Hiérarchie des acteurs
    GuestUser -.-> AuthUser
    AuthUser -.-> GroupMember
    GroupMember -.-> GroupCreator
    
    %% Styles
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px
    classDef publication fill:#ccf,stroke:#333,stroke-width:1px
    classDef messaging fill:#cfc,stroke:#333,stroke-width:1px
    classDef electron fill:#ffc,stroke:#333,stroke-width:1px
    
    class GuestUser,AuthUser,GroupMember,GroupCreator actor
    class PS,PS1,PS2,PS3,PS4,PS5,PS6,PS7,PS8,PS9,PS10,PS11,PS12,PS13,PS14,PS15,PS16,PS17 publication
    class MS,MS1,MS2,MS3,MS4,MS5,MS6,MS7,MS8,MS9 messaging
    class EL,E1,E2,E3,E4 electron