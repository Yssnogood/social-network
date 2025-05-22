Voici le contenu prêt à être copié-collé dans un fichier `guide_websocket.md` :

# Guide de Mise en Place des WebSockets pour le Réseau Social

## 📊 Objectif
Mettre en place une architecture WebSocket permettant une communication en temps réel pour les fonctionnalités suivantes :

- ✉️ Envoi/réception de messages instantanés (privés ou de groupe)
- ⌨️ Statut "en train d'écrire"
- 📊 Notification de lecture
- 📢 Notifications push (invitations, likes, messages, etc.)
- 🔌 Statut de connexion des utilisateurs (optionnel)


## 📄 Structure du projet backend (Go)

```
/backend/websocket/
├── hub.go # Gère les connexions, messages, diffusions
├── client.go # Représente un utilisateur connecté
├── manager.go # (Optionnel) Un hub par groupe ou conversation
├── handler.go # Point d'entrée WebSocket via HTTP
├── events/
│ ├── message.go # Gestion des événements de message
│ ├── typing.go # Gestion du "typing"
│ └── notification.go # Notifications temps réel (invits, etc.)
```

## ✏️ Design des événements WebSocket :

Tous les messages WS utilisent le format suivant :

```json
{
  "event": "message/send",
  "data": { "conversation_id": 42, "content": "Hello" }
}
```

### 📋 Événements à gérer :

| Event name          | Data requis                    | Action                                 |                                      |
| ------------------- | ------------------------------ | -------------------------------------- | ------------------------------------ |
| `message/send`      | `{ conversation_id, content }` | Diffuse à tous les membres             |                                      |
| `message/group`     | `{ group_id, content }`        | Diffuse aux membres du groupe          |                                      |
| `message/read`      | `{ message_id }`               | Marque un message comme lu             |                                      |
| `typing/start`      | \`{ conversation\_id           | group\_id }\`                          | Notifie les autres membres           |
| `typing/stop`       | \`{ conversation\_id           | group\_id }\`                          | Stop l'affichage "en train d'écrire" |
| `notification/push` | `{ type, user_id, content }`   | Envoie une notification en temps réel  |                                      |
| `user/online`       | `{ user_id }`                  | Affiche que l'utilisateur est connecté |                                      |

---

## 👥 Structure côté client (React / Vite)

```
/frontend/
├── services/websocket.js       // Gère ouverture WS + events
├── hooks/useSocket.js          // Hook React lié au WebSocket
├── context/SocketProvider.jsx  // Fournit le socket à l'appli
└── components/ChatWindow.jsx   // Affiche messages, "typing", etc.
```

Exemple client :

```js
socket.send(JSON.stringify({
  event: "message/group",
  data: { group_id: 1, content: "Hello team!" }
}))
```

---

## ⚖️ Bonnes pratiques

* Authentification via session/cookie (pas JWT dans WS)
* Valider tous les payloads JSON (type, données)
* Envoyer une réponse `event: "error"` en cas d'échec
* Implémenter `ping/pong` pour maintenir la connexion
* Enregistrer l'activité utilisateur (statut "online")

---

## 📅 Feuille de route technique

### ✅ Phase 1 : Mise en place WebSocket de base

* [ ] `hub.go`, `client.go`, `handler.go`
* [ ] Connexion via `/ws` avec authentification
* [ ] Implémenter `message/send` et `message/group`

### ✅ Phase 2 : Interaction sociale

* [ ] Typing (`typing/start`, `typing/stop`)
* [ ] Confirmation de lecture (`message/read`)
* [ ] Statuts connectés (optionnel)

### ✅ Phase 3 : Notifications et groupes

* [ ] `notification/push` pour invitations de groupe, etc.
* [ ] Diffusion ciblée aux membres du groupe concerné

---

## 🔗 Sources utiles

* Gorilla WebSocket : [https://github.com/gorilla/websocket](https://github.com/gorilla/websocket)
* MDN WebSocket : [https://developer.mozilla.org/fr/docs/Web/API/WebSocket](https://developer.mozilla.org/fr/docs/Web/API/WebSocket)
* RFC WebSocket : [https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)



