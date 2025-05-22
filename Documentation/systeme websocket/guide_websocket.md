# Guide WebSocket pour le Réseau Social et l'Application de Messagerie

## 📊 Objectif

Fournir une architecture WebSocket modulaire et multiplateforme pour :

* ✉️ Messages instantanés (privés & groupes)
* ⌨️ Indicateur "en train d'écrire"
* 🔍 Accusé de lecture & synchronisation de messages
* 📢 Notifications push (groupes, invites, etc.)
* 🎮 Intégration future avec une app Messenger (web + Electron)

## 🔄 Vision multiplateforme

> Le WebSocket doit être le **même pour le web et Electron**.
>
> L'état du chat doit être synchronisé sur plusieurs clients (ex: mobile + bureau).

---

## 📄 Structure backend (Go)

```
/backend/websocket/
├── hub.go               # Gère les connexions WebSocket
├── client.go            # Représente une connexion client (web ou Electron)
├── router.go            # Route les messages par type
├── presence.go          # Statuts connecté/hors-ligne
├── events/
│   ├── chat_message.go     # Envoi/réception de messages
│   ├── group_message.go    # Spécifique aux groupes
│   ├── typing.go           # Indicateur de frappe
│   ├── read_receipt.go     # Confirmation de lecture
│   └── notification.go     # Notification push (invites, etc.)
```

## 🌐 Format de message unifié

```json
{
  "type": "group_message", // ou chat_message, typing_indicator, etc.
  "payload": { ... },
  "meta": {
    "timestamp": 1716523432,
    "sender_id": 1,
    "target_id": 2,
    "client_id": "uuid-client"
  }
}
```

### ✉️ Types de messages supportés

| Type               | Description                                  |
| ------------------ | -------------------------------------------- |
| `chat_message`     | Message direct entre 2 utilisateurs          |
| `group_message`    | Message dans un groupe de discussion         |
| `typing_indicator` | Indicateur de frappe                         |
| `read_receipt`     | Confirme la lecture d'un message             |
| `notification`     | Notification de type invitation, ajout, etc. |
| `status_update`    | Changement de statut (en ligne, absent...)   |
| `connection_event` | Connexion ou déconnexion                     |

---

## 🚀 Backend → Modules clés

### WebSocketManager

* Gère les connexions actives (web, mobile, Electron)
* Attribue un `client_id` unique par connexion

### MessageRouter

* Redirige les événements entrants vers le bon gestionnaire
* Implémente les files d'attente offline si destinataire déconnecté

### PresenceService

* Maintient la liste des utilisateurs connectés
* Diffuse `status_update` à leurs contacts

### HistorySaver

* Sauvegarde chaque message en base
* Marque les non-lus + archivage (utile pour Electron)

---

## 📄 Côté client (Next.js + future Electron)

```
/frontend/
├── services/SocketManager.js     # Classe commune Web / Electron
├── hooks/useSocket.js            # Hook WebSocket React
├── context/SocketContext.jsx     # Fournisseur global
├── api/MessagingAPI.js           # API haut niveau (send, read, etc.)
└── components/ChatWindow.jsx     # Affichage messages, status, etc.
```

```js
socket.send({
  type: "group_message",
  payload: {
    group_id: 1,
    content: "Bonjour à tous!"
  },
  meta: {
    sender_id: 42,
    client_id: "web-client-xyz"
  }
})
```

### Fonctionnalités client prioritaires

* `sendPrivateMessage(userId, content)`
* `sendGroupMessage(groupId, content)`
* `updateStatus(online/offline)`
* `markAsRead(messageId)`
* `subscribeToTyping(conversation_id)`

---

## ⚖️ API REST complémentaire

Pour fonctionnement offline/Electron :

* `GET /api/messages/user/{id}`

  * 🔁 Exemple : récupérer les derniers messages d’un contact
* `GET /api/messages/group/{id}`

  * 📦 Exemple : historique des messages d’un groupe
* `GET /api/users/{id}/status`

  * ✅ Exemple : vérifier si l’utilisateur est en ligne
* `POST /api/messages/read`

  * 📩 Exemple : notifier qu’un message est lu

---

## 📝 Bonnes pratiques

* Utiliser le **même protocole WS** côté web & Electron
* Définir des `client_id` uniques pour chaque client connecté
* Implémenter `heartbeat` pour gérer les déconnexions
* Sauvegarder tous les messages pour synchronisation ultérieure

---

## 📅 Roadmap technique (avec exemples)

### Phase 1: Infrastructure WS

1. `hub.go`, `client.go`, `handler.go`

   * Exemple : struct `Client` avec `Send` et `Conn`
2. Connexion `/ws`, authentification + `client_id`

   * Exemple : lecture du cookie de session + assignation `uuid`
3. `chat_message`, `group_message`

   * Exemple : router.go qui dispatch `chat_message` vers `chat_message.go`

### Phase 2: Fonctionnalités sociales temps réel

1. `typing_indicator`

   * Exemple : envoie un message WS `{type: "typing_indicator", payload: {conversation_id: 4}}`
2. `read_receipt`

   * Exemple : réception d’un accusé via `{type: "read_receipt", payload: {message_id: 98}}`
3. `status_update`

   * Exemple : ping régulier + diffusion `online/offline` à tous les contacts

### Phase 3: Notifications + Intégration multiplateforme

1. `notification` (invites, likes...)

   * Exemple : `{type: "notification", payload: {type: "group_invite", group_id: 12}}`
2. REST API messages + synchronisation

   * Exemple : `/api/messages/user/{id}` consulté par Electron au lancement

---

## 🔗 Sources utiles

* Gorilla WebSocket : [https://github.com/gorilla/websocket](https://github.com/gorilla/websocket)
* MDN WebSocket JS : [https://developer.mozilla.org/fr/docs/Web/API/WebSocket](https://developer.mozilla.org/fr/docs/Web/API/WebSocket)
* RFC WebSocket : [https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)

---