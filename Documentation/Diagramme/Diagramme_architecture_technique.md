graph TD
    %% Clients
    subgraph "Clients"
        A[Navigateur Web - Next.js]
        B[Application Electron]
        
        subgraph "Fonctionnalités Electron"
            E1[Mode Hors Ligne]
            E2[Base de données locale]
            E3[Synchronisation]
            E4[Moteur de recherche]
            E5[Notifications système]
        end
        
        B --> E1
        B --> E2
        B --> E3
        B --> E4
        B --> E5
    end
    
    %% Backend
    subgraph "Backend (Go)"
        %% API
        subgraph "API"
            C[API Router]
            
            subgraph "Contrôleurs Publications"
                CP1[AuthController]
                CP2[UserController]
                CP3[PostController]
                CP4[GroupController]
                CP5[EventController]
            end
            
            subgraph "Contrôleurs Messagerie"
                CM1[ConversationController]
                CM2[InstantMessageController]
                CM3[TypingStatusController]
                CM4[OfflineSyncController]
            end
            
            C --> CP1
            C --> CP2
            C --> CP3
            C --> CP4
            C --> CP5
            C --> CM1
            C --> CM2
            C --> CM3
            C --> CM4
        end
        
        %% WebSocket
        subgraph "WebSocket Server"
            D[WebSocket Manager]
            D1[Channel Manager]
            D2[Message Router]
            D3[Presence Service]
            
            D --> D1
            D --> D2
            D --> D3
        end
        
        %% Services
        subgraph "Services"
            subgraph "Services Publications"
                SP1[AuthService]
                SP2[UserService]
                SP3[PostService]
                SP4[GroupService]
                SP5[EventService]
            end
            
            subgraph "Services Messagerie"
                SM1[ConversationService]
                SM2[InstantMessageService]
                SM3[TypingStatusService]
                SM4[ReadReceiptService]
                SM5[OfflineSyncService]
            end
            
            SN[NotificationService]
        end
        
        %% Repositories
        subgraph "Repositories"
            subgraph "Repositories Publications"
                RP1[UserRepository]
                RP2[PostRepository]
                RP3[GroupRepository]
                RP4[EventRepository]
                RP5[SessionRepository]
            end
            
            subgraph "Repositories Messagerie"
                RM1[ConversationRepository]
                RM2[InstantMessageRepository]
                RM3[TypingStatusRepository]
                RM4[ReadReceiptRepository]
            end
            
            RN[NotificationRepository]
        end
    end
    
    %% Base de données
    subgraph "Base de données"
        DB[SQLite]
        
        subgraph "Migrations"
            M1[Migration Publications]
            M2[Migration Messagerie]
            
            M1 --> DB
            M2 --> DB
        end
    end
    
    %% Infrastructure
    subgraph "Infrastructure"
        DC1[Docker Container - Frontend]
        DC2[Docker Container - Backend]
    end
    
    %% Connexions entre composants
    A <--> C
    B <--> C
    A <--> D
    B <--> D
    
    %% Connexions API -> Services
    CP1 --> SP1
    CP2 --> SP2
    CP3 --> SP3
    CP4 --> SP4
    CP5 --> SP5
    
    CM1 --> SM1
    CM2 --> SM2
    CM3 --> SM3
    CM4 --> SM5
    
    CP1 --> SN
    CP2 --> SN
    CP3 --> SN
    CP4 --> SN
    CP5 --> SN
    CM1 --> SN
    CM2 --> SN
    
    %% Connexions WebSocket -> Services
    D --> SM2
    D --> SM3
    D --> SM4
    D --> SN
    D3 --> SP2
    
    %% Connexions Services -> Repositories
    SP1 --> RP1
    SP1 --> RP5
    SP2 --> RP1
    SP3 --> RP2
    SP4 --> RP3
    SP5 --> RP4
    
    SM1 --> RM1
    SM2 --> RM2
    SM3 --> RM3
    SM4 --> RM4
    SM5 --> RM2
    
    SN --> RN
    
    %% Connexions Repositories -> DB
    RP1 --> DB
    RP2 --> DB
    RP3 --> DB
    RP4 --> DB
    RP5 --> DB
    
    RM1 --> DB
    RM2 --> DB
    RM3 --> DB
    RM4 --> DB
    
    RN --> DB
    
    %% Connexions Infrastructure
    DC1 --> A
    DC2 --> C
    DC2 --> D
    
    %% Connexions Mode Hors Ligne
    E1 <--> E2
    E1 <--> E3
    E3 <--> CM4
    E4 <--> E2
    
    %% Styles
    classDef client fill:#d5e8d4,stroke:#82b366
    classDef electron fill:#d5e8d4,stroke:#82b366,stroke-dasharray: 5 5
    classDef api fill:#dae8fc,stroke:#6c8ebf
    classDef apiPublication fill:#dae8fc,stroke:#6c8ebf
    classDef apiMessaging fill:#d4e1f5,stroke:#6c8ebf
    classDef ws fill:#c3fac0,stroke:#82b366
    classDef servicePublication fill:#fff2cc,stroke:#d6b656
    classDef serviceMessaging fill:#f9ebb7,stroke:#d6b656
    classDef serviceCommon fill:#fff2cc,stroke:#d6b656,stroke-width:2px
    classDef repoPublication fill:#f8cecc,stroke:#b85450
    classDef repoMessaging fill:#f5bcba,stroke:#b85450
    classDef repoCommon fill:#f8cecc,stroke:#b85450,stroke-width:2px
    classDef db fill:#e1d5e7,stroke:#9673a6
    classDef infra fill:#ffe6cc,stroke:#d79b00
    
    class A client
    class B,E1,E2,E3,E4,E5 electron
    class C api
    class CP1,CP2,CP3,CP4,CP5 apiPublication
    class CM1,CM2,CM3,CM4 apiMessaging
    class D,D1,D2,D3 ws
    class SP1,SP2,SP3,SP4,SP5 servicePublication
    class SM1,SM2,SM3,SM4,SM5 serviceMessaging
    class SN serviceCommon
    class RP1,RP2,RP3,RP4,RP5 repoPublication
    class RM1,RM2,RM3,RM4 repoMessaging
    class RN repoCommon
    class DB,M1,M2 db
    class DC1,DC2 infra