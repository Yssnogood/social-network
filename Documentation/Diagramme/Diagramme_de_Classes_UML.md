classDiagram
    %% Domain Models - Core
    class User {
        +int ID
        +string Email
        +string PasswordHash
        +string FirstName
        +string LastName
        +date BirthDate
        +string AvatarPath
        +string Username
        +string AboutMe
        +bool IsPublic
        +bool OnlineStatus
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +List~Follow~ Followers
        +List~Follow~ Following
    }

    class Session {
        +int ID
        +int UserID
        +string Token
        +DateTime ExpiresAt
        +string ClientID
        +string DeviceInfo
        +bool IsValid()
        +Refresh()
    }

    class Notification {
        +int ID
        +int UserID
        +int Type
        +int ReferenceID
        +string ReferenceType
        +bool IsRead
        +DateTime CreatedAt
        +MarkAsRead()
        +GetReference()
    }

    class Follow {
        +int ID
        +int FollowerID
        +int FollowedID
        +bool IsAccepted
        +DateTime CreatedAt
        +Accept()
        +Reject()
    }

    %% Domain Models - Publication System
    class Post {
        +int ID
        +int UserID
        +string Content
        +string ImagePath
        +int PrivacyType
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +AddComment(userId, content)
        +UpdatePrivacy(privacyType)
        +AddAllowedUser(userId)
    }

    class Comment {
        +int ID
        +int PostID
        +int UserID
        +string Content
        +string ImagePath
        +DateTime CreatedAt
    }

    class Group {
        +int ID
        +int CreatorID
        +string Title
        +string Description
        +DateTime CreatedAt
        +AddMember(userId)
        +RemoveMember(userId)
        +CreatePost(userId, content)
        +CreateEvent(title, description, date)
    }

    class GroupMember {
        +int ID
        +int GroupID
        +int UserID
        +bool IsAccepted
        +DateTime CreatedAt
        +Accept()
        +Reject()
    }

    class GroupPost {
        +int ID
        +int GroupID
        +int UserID
        +string Content
        +string ImagePath
        +DateTime CreatedAt
        +AddComment(userId, content)
    }

    class GroupComment {
        +int ID
        +int GroupPostID
        +int UserID
        +string Content
        +string ImagePath
        +DateTime CreatedAt
    }

    class Event {
        +int ID
        +int GroupID
        +int CreatorID
        +string Title
        +string Description
        +DateTime EventTime
        +DateTime CreatedAt
        +AddOption(optionText)
        +GetResponses()
    }

    class EventOption {
        +int ID
        +int EventID
        +string OptionText
    }

    class EventResponse {
        +int ID
        +int EventID
        +int UserID
        +int OptionID
        +DateTime CreatedAt
    }

    %% Domain Models - Instant Messaging System
    class Conversation {
        +int ID
        +string Name
        +bool IsGroup
        +DateTime CreatedAt
        +AddParticipant(userId)
        +RemoveParticipant(userId)
        +SendMessage(senderId, content, referenceMessageId)
    }

    class ConversationParticipant {
        +int ID
        +int ConversationID
        +int UserID
        +DateTime JoinedAt
    }

    class InstantMessage {
        +int ID
        +int ConversationID
        +int SenderID
        +int ReferenceMessageID
        +string Content
        +string ImagePath
        +bool IsRead
        +DateTime CreatedAt
        +MarkAsRead(userId)
        +ReplyTo(senderId, content)
    }

    class TypingStatus {
        +int ID
        +int ConversationID
        +int UserID
        +DateTime LastUpdated
        +Update()
        +IsActive()
    }

    class ReadReceipt {
        +int ID
        +int MessageID
        +int UserID
        +DateTime ReadAt
    }

    %% Service Interfaces
    class IMessagingService {
        <<interface>>
        +CreateConversation(creatorId, name, isGroup, participantIds)
        +GetConversations(userId)
        +GetConversation(conversationId)
        +GetPrivateConversation(user1Id, user2Id)
        +SendMessage(senderId, conversationId, content, imageId, referenceMessageId)
        +MarkMessageAsRead(messageId, userId)
        +GetMessages(conversationId, pagination)
        +UpdateTypingStatus(userId, conversationId)
        +GetActiveTypers(conversationId)
    }

    class INotificationService {
        <<interface>>
        +CreateNotification(userId, type, referenceId, referenceType)
        +GetUserNotifications(userId)
        +MarkAsRead(notificationId)
        +BroadcastNotification(notification)
    }

    %% WebSocket Components
    class WebSocketManager {
        -Map~string, WebSocketClient~ Clients
        +AddClient(userId, clientId, connection)
        +RemoveClient(clientId)
        +GetClientsByUser(userId)
        +BroadcastToUser(userId, message)
        +BroadcastToConversation(conversationId, message)
        +BroadcastToAll(message)
    }

    class WebSocketClient {
        +string ClientID
        +int UserID
        +WebSocket Connection
        +Send(message)
        +Close()
    }

    class WebSocketMessage {
        +string Type
        +object Payload
        +object Meta
    }

    class ChannelManager {
        -Map~string, List~WebSocketClient~~ Channels
        +CreateChannel(channelId)
        +DeleteChannel(channelId)
        +SubscribeToChannel(channelId, client)
        +UnsubscribeFromChannel(channelId, clientId)
        +BroadcastToChannel(channelId, message)
    }

    %% Electron-specific Components
    class OfflineSync {
        +SyncMessages(userId, lastSyncTime)
        +SyncConversations(userId, lastSyncTime)
        +GetUnreadMessages(userId)
        +SaveMessagesLocally(messages)
        +SendQueuedMessages(userId)
    }

    class MessageSearchEngine {
        +SearchMessages(userId, query, options)
        +IndexNewMessages(messages)
        +BuildSearchIndex(userId)
    }

    class NetworkStatus {
        +bool IsOnline
        +MonitorConnection()
        +HandleOfflineMode()
        +HandleReconnection()
        +GetLastOnlineTime()
    }

    %% Relationships between models
    User "1" -- "n" Post : Creates
    User "1" -- "n" Comment : Writes
    Post "1" -- "n" Comment : Has
    User "1" -- "n" Follow : Follower
    User "1" -- "n" Follow : Followed
    User "1" -- "n" Group : Creates
    User "n" -- "n" Group : Member
    Group "1" -- "n" GroupPost : Contains
    User "1" -- "n" GroupPost : Creates
    GroupPost "1" -- "n" GroupComment : Has
    User "1" -- "n" GroupComment : Writes
    Group "1" -- "n" Event : Hosts
    User "1" -- "n" Event : Creates
    Event "1" -- "n" EventOption : Has
    Event "1" -- "n" EventResponse : Receives
    User "1" -- "n" EventResponse : Submits
    EventOption "1" -- "n" EventResponse : Selected

    
    User "n" -- "n" Conversation : Participates
    Conversation "1" -- "n" ConversationParticipant : Has
    User "1" -- "n" ConversationParticipant : Joins
    Conversation "1" -- "n" InstantMessage : Contains
    User "1" -- "n" InstantMessage : Sends
    InstantMessage "0..1" -- "n" InstantMessage : References
    User "1" -- "n" TypingStatus : Updates
    Conversation "1" -- "n" TypingStatus : Displays
    InstantMessage "1" -- "n" ReadReceipt : IsReadBy
    User "1" -- "n" ReadReceipt : Reads

    
    User "1" -- "n" Notification : Receives
    User "1" -- "n" Session : Has

    %% WebSocket relationships
    WebSocketManager "1" -- "n" WebSocketClient : Manages
    WebSocketManager ..> WebSocketMessage
    WebSocketManager "1" -- "1" ChannelManager : Uses
    ChannelManager "1" -- "n" WebSocketClient : Groups

    
    %% Electron components relationships
    OfflineSync --> InstantMessage : Synchronizes
    OfflineSync --> Conversation : Synchronizes
    MessageSearchEngine --> InstantMessage : Indexes
    NetworkStatus --> OfflineSync : Triggers
