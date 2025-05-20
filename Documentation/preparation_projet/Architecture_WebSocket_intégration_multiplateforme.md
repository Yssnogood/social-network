# Architecture WebSocket pour intégration multiplateforme

## 1. Principes d'architecture

### 1.1 Protocole unifié de communication

```
{
  "type": "message_type",
  "payload": {
    // données spécifiques au type de message
  },
  "meta": {
    "timestamp": 1619438530,
    "sender_id": "user_id",
    "target_id": "user_id/group_id",
    "client_id": "unique_client_identifier"
  }
}
```

Les types de messages incluront:
- `chat_message` - Message direct entre utilisateurs
- `group_message` - Message dans un groupe
- `status_update` - Changement de statut (en ligne/hors ligne)
- `notification` - Notification système
- `typing_indicator` - Indicateur de frappe
- `read_receipt` - Accusé de lecture
- `connection_event` - Événements de connexion/déconnexion

### 1.2 Architecture de connexion

- **Gestion multi-client**: Un utilisateur peut avoir plusieurs clients connectés simultanément (web, desktop, etc.)
- **Identifiants de client uniques**: Chaque connexion reçoit un identifiant unique
- **État synchronisé**: L'état de conversation est synchronisé entre tous les clients

## 2. Structure du serveur WebSocket

### 2.1 Composants principaux

1. **WebSocketManager**: Gestionnaire central des connexions
   - Gère l'enregistrement/désenregistrement des connexions
   - Maintient un mapping utilisateur → connexions actives

2. **ChannelManager**: Gestionnaire des canaux de communication
   - Canaux utilisateur à utilisateur
   - Canaux de groupe
   - Canaux de diffusion (pour notifications)

3. **MessageRouter**: Achemine les messages vers les destinataires
   - Gère la logique de routage
   - Implémente files d'attente pour les destinataires hors ligne

4. **PresenceService**: Gère l'état de présence des utilisateurs
   - Maintient l'état en ligne/hors ligne
   - Diffuse les mises à jour de statut aux abonnés

### 2.2 Gestion de la persistance

1. **HistorySaver**: Sauvegarde les messages en base de données
   - Enregistre tous les messages pour historique
   - Marque les messages non lus

2. **OfflineQueue**: File d'attente pour destinataires hors ligne
   - Stocke les messages pour livraison différée
   - Priorise les messages selon leur type

## 3. API REST complémentaire pour Electron

Pour permettre l'intégration facile avec Electron, une API REST complète accompagnera les WebSockets:

1. **Message History API**
   - `GET /api/messages/user/{user_id}` - Historique de conversation avec un utilisateur
   - `GET /api/messages/group/{group_id}` - Historique de conversation d'un groupe
   - Pagination pour chargement efficace
   - Filtre par date/contenu pour recherche

2. **Status API**
   - `GET /api/users/{user_id}/status` - Récupérer le statut actuel
   - `GET /api/users/following/status` - Récupérer le statut des utilisateurs suivis

3. **Offline Support API**
   - `GET /api/messages/undelivered` - Récupérer les messages non livrés
   - `POST /api/messages/read` - Marquer des messages comme lus

## 4. Gestion de la connexion et reconnexion

1. **Protocol de reconnexion**
   - Identifiants de session persistants
   - Reprise de session basée sur le dernier message reçu
   - Synchronisation automatique après reconnexion

2. **Heartbeat et détection de déconnexion**
   - Pings périodiques pour vérifier la connexion
   - Délai de grâce avant de considérer un client comme hors ligne

## 5. Implémentation côté client

### 5.1 Couche d'abstraction WebSocket

```javascript
// Socket Manager qui sera réutilisable entre web et Electron
class SocketManager {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.socket = null;
    this.clientId = generateUniqueId();
    this.messageHandlers = new Map();
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
  }

  connect() {
    // Logique de connexion
  }

  reconnect() {
    // Logique de reconnexion avec backoff exponentiel
  }

  sendMessage(type, payload, targetId) {
    // Formatage et envoi de message
  }

  registerHandler(messageType, handler) {
    // Enregistrement des gestionnaires par type de message
  }

  disconnect() {
    // Déconnexion propre
  }

  // Événements génériques
  onConnectionStateChange(callback) {}
  onMessage(callback) {}
  onError(callback) {}
}
```

### 5.2 API de messagerie de haut niveau

```javascript
// API de haut niveau qui utilisera SocketManager
class MessagingAPI {
  constructor(socketManager, restApiClient) {
    this.socketManager = socketManager;
    this.restApi = restApiClient;
  }

  // Messages privés
  sendPrivateMessage(userId, content, attachments = []) {}
  getPrivateMessageHistory(userId, pagination = {}) {}
  
  // Messages de groupe
  sendGroupMessage(groupId, content, attachments = []) {}
  getGroupMessageHistory(groupId, pagination = {}) {}
  
  // Gestion de statut
  updateStatus(status) {}
  subscribeToUserStatus(userIds) {}
  
  // Notifications
  subscribeToNotifications(callback) {}
  
  // Synchronisation hors ligne/en ligne
  synchronizeMessages() {}
  markAsRead(messageIds) {}
  
  // Recherche
  searchMessages(query, options = {}) {}
}
```