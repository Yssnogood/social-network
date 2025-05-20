sequenceDiagram
    participant Client1 as Client Créateur
    participant Client2 as Client Membre
    participant Client3 as Client Invité
    participant API as API REST
    participant GS as GroupService
    participant ES as EventService
    participant GR as GroupRepository
    participant GMR as GroupMemberRepository
    participant ER as EventRepository
    participant EOR as EventOptionRepository
    participant ERR as EventResponseRepository
    participant NS as NotificationService
    participant WSM as WebSocketManager
    participant DB as Base de données SQLite

    %% Phase 1: Création d'un groupe
    Client1->>API: POST /api/groups (title, description)
    API->>GS: CreateGroup(creatorId, title, description)
    GS->>GR: Create(group)
    GR->>DB: INSERT INTO groups
    DB-->>GR: group_id
    GR-->>GS: Created Group
    
    GS->>GMR: AddMember(groupId, creatorId, isAccepted: true)
    GMR->>DB: INSERT INTO group_members
    GS-->>API: Groupe créé
    API-->>Client1: 201 Created (group)

    %% Phase 2: Invitation d'un membre
    Client1->>API: POST /api/groups/{group_id}/invitations (user_id)
    API->>GS: InviteToGroup(groupId, inviterId, inviteeId)
    GS->>GR: GetByID(groupId)
    GR->>DB: SELECT FROM groups WHERE id = ?
    DB-->>GR: Group
    GR-->>GS: Group
    
    GS->>GMR: IsGroupMember(inviterId, groupId)
    GMR->>DB: SELECT FROM group_members WHERE group_id = ? AND user_id = ? AND is_accepted = true
    DB-->>GMR: Membership (true)
    GMR-->>GS: true
    
    GS->>GMR: AddMember(groupId, inviteeId, isAccepted: false)
    GMR->>DB: INSERT INTO group_members (group_id, user_id, is_accepted) VALUES (?, ?, false)
    
    GS->>NS: CreateNotification(inviteeId, GROUP_INVITATION_TYPE, groupId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(inviteeId, notification)
    WSM->>Client3: WS: {"type": "notification", "payload": {...}}
    
    GS-->>API: Invitation envoyée
    API-->>Client1: 200 OK

    %% Phase 3: Acceptation d'invitation
    Client3->>API: POST /api/groups/invitations/{membership_id}/accept
    API->>GS: AcceptGroupInvitation(membershipId)
    GS->>GMR: GetByID(membershipId)
    GMR->>DB: SELECT FROM group_members WHERE id = ?
    DB-->>GMR: GroupMember
    GMR-->>GS: GroupMember
    
    GS->>GMR: AcceptInvitation(membershipId)
    GMR->>DB: UPDATE group_members SET is_accepted = true WHERE id = ?
    
    GS->>GR: GetByID(groupId)
    GR->>DB: SELECT FROM groups WHERE id = ?
    DB-->>GR: Group
    GR-->>GS: Group
    
    GS->>NS: CreateNotification(group.creatorId, GROUP_JOIN_TYPE, inviteeId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(group.creatorId, notification)
    WSM->>Client1: WS: {"type": "notification", "payload": {...}}
    
    GS-->>API: Invitation acceptée
    API-->>Client3: 200 OK

    %% Phase 4: Demande de rejoindre un groupe
    Client2->>API: POST /api/groups/{group_id}/join-requests
    API->>GS: RequestJoinGroup(groupId, userId)
    GS->>GR: GetByID(groupId)
    GR->>DB: SELECT FROM groups WHERE id = ?
    DB-->>GR: Group (avec creator_id)
    GR-->>GS: Group
    
    GS->>GMR: AddMember(groupId, userId, isAccepted: false)
    GMR->>DB: INSERT INTO group_members (group_id, user_id, is_accepted) VALUES (?, ?, false)
    
    GS->>NS: CreateNotification(group.creatorId, GROUP_JOIN_REQUEST_TYPE, userId, groupId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(group.creatorId, notification)
    WSM->>Client1: WS: {"type": "notification", "payload": {...}}
    
    GS-->>API: Demande envoyée
    API-->>Client2: 202 Accepted

    %% Phase 5: Acceptation d'une demande d'adhésion
    Client1->>API: POST /api/groups/join-requests/{membership_id}/accept
    API->>GS: AcceptJoinRequest(membershipId)
    GS->>GMR: GetByID(membershipId)
    GMR->>DB: SELECT FROM group_members WHERE id = ?
    DB-->>GMR: GroupMember
    GMR-->>GS: GroupMember
    
    GS->>GMR: AcceptJoinRequest(membershipId)
    GMR->>DB: UPDATE group_members SET is_accepted = true WHERE id = ?
    
    GS->>NS: CreateNotification(groupMember.userId, GROUP_JOIN_ACCEPTED_TYPE, groupId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(groupMember.userId, notification)
    WSM->>Client2: WS: {"type": "notification", "payload": {...}}
    
    GS-->>API: Demande acceptée
    API-->>Client1: 200 OK

    %% Phase 6: Création d'un événement
    Client1->>API: POST /api/groups/{group_id}/events (title, description, event_time, options[])
    API->>ES: CreateEvent(userId, groupId, title, description, eventTime)
    ES->>GR: GetByID(groupId)
    GR->>DB: SELECT FROM groups WHERE id = ?
    DB-->>GR: Group
    GR-->>ES: Group
    
    ES->>GMR: IsGroupMember(userId, groupId)
    GMR->>DB: SELECT FROM group_members WHERE group_id = ? AND user_id = ? AND is_accepted = true
    DB-->>GMR: Membership (true)
    GMR-->>ES: true
    
    ES->>ER: Create(event)
    ER->>DB: INSERT INTO events
    DB-->>ER: event_id
    ER-->>ES: Created Event
    
    loop Pour chaque option
        ES->>EOR: Create(eventId, optionText)
        EOR->>DB: INSERT INTO event_options
    end
    
    ES->>GMR: GetGroupMembers(groupId)
    GMR->>DB: SELECT FROM group_members WHERE group_id = ? AND is_accepted = true
    DB-->>GMR: Members
    GMR-->>ES: Members
    
    loop Pour chaque membre (sauf le créateur)
        ES->>NS: CreateNotification(memberId, EVENT_CREATED_TYPE, eventId)
        NS->>DB: INSERT INTO notifications
        NS->>WSM: BroadcastToUser(memberId, notification)
    end
    
    WSM->>Client2: WS: {"type": "notification", "payload": {...}}
    
    ES-->>API: Événement créé
    API-->>Client1: 201 Created (event)

    %% Phase 7: Réponse à un événement
    Client2->>API: POST /api/events/{event_id}/responses (option_id)
    API->>ES: RespondToEvent(userId, eventId, optionId)
    ES->>ER: GetByID(eventId)
    ER->>DB: SELECT FROM events WHERE id = ?
    DB-->>ER: Event
    ER-->>ES: Event
    
    ES->>GMR: IsGroupMember(userId, event.groupId)
    GMR->>DB: SELECT FROM group_members WHERE group_id = ? AND user_id = ? AND is_accepted = true
    DB-->>GMR: Membership (true)
    GMR-->>ES: true
    
    ES->>ERR: Create(eventId, userId, optionId)
    ERR->>DB: INSERT INTO event_responses
    
    ES->>NS: CreateNotification(event.creatorId, EVENT_RESPONSE_TYPE, userId, eventId)
    NS->>DB: INSERT INTO notifications
    NS->>WSM: BroadcastToUser(event.creatorId, notification)
    WSM->>Client1: WS: {"type": "notification", "payload": {...}}
    
    ES-->>API: Réponse enregistrée
    API-->>Client2: 200 OK