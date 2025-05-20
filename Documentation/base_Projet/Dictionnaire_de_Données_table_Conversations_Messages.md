# Dictionnaire de Données pour Messagerie Instantanée

## Table: conversations
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la conversation | PRIMARY KEY, AUTOINCREMENT |
| name | TEXT | - | Nom de la conversation (pour les groupes) | NULL |
| is_group | BOOLEAN | - | Indique s'il s'agit d'une conversation de groupe | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Description
Cette table stocke les conversations entre utilisateurs. Une conversation peut être :
- Une conversation privée entre deux utilisateurs (is_group = false, name = null)
- Une conversation de groupe avec un nom explicite (is_group = true, name non null)

### Règles métier
- Une conversation privée implique exactement deux participants
- Une conversation de groupe doit avoir au moins deux participants
- Le nom est obligatoire pour une conversation de groupe
- Une conversation privée ne doit pas avoir de doublon (même paire d'utilisateurs)

## Table: conversation_participants
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| conversation_id | INTEGER | - | Identifiant de la conversation | NOT NULL, FOREIGN KEY (conversations.id) |
| user_id | INTEGER | - | Identifiant du participant | NOT NULL, FOREIGN KEY (users.id) |
| joined_at | TIMESTAMP | - | Date et heure d'ajout à la conversation | DEFAULT CURRENT_TIMESTAMP |

### Description
Cette table établit la relation many-to-many entre les utilisateurs et les conversations auxquelles ils participent.

### Règles métier
- Un utilisateur ne peut participer qu'une seule fois à une même conversation
- La suppression d'une conversation entraîne la suppression de tous ses participants (ON DELETE CASCADE)
- La suppression d'un utilisateur entraîne sa suppression de toutes les conversations (ON DELETE CASCADE)

## Table: instant_messages
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique du message | PRIMARY KEY, AUTOINCREMENT |
| conversation_id | INTEGER | - | Identifiant de la conversation | NOT NULL, FOREIGN KEY (conversations.id) |
| sender_id | INTEGER | - | Identifiant de l'expéditeur | NOT NULL, FOREIGN KEY (users.id) |
| reference_message_id | INTEGER | - | Identifiant du message référencé (pour les réponses) | NULL, FOREIGN KEY (instant_messages.id) |
| content | TEXT | - | Contenu du message | NOT NULL |
| image_path | TEXT | - | Chemin vers l'image associée | NULL |
| is_read | BOOLEAN | - | Indique si le message a été lu (pour les conversations privées) | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure d'envoi | DEFAULT CURRENT_TIMESTAMP |

### Description
Cette table stocke tous les messages échangés dans les conversations. Un message peut faire référence à un autre message précédent (réponse).

### Règles métier
- Un message doit appartenir à une conversation existante
- L'expéditeur doit être un participant de la conversation
- Un message peut faire référence à un autre message de la même conversation
- Le contenu ne peut pas être vide
- Si reference_message_id est renseigné, il doit pointer vers un message existant de la même conversation
- La suppression d'une conversation entraîne la suppression de tous ses messages (ON DELETE CASCADE)
- Si un message référencé est supprimé, reference_message_id devient NULL (ON DELETE SET NULL)

## Table: typing_status
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| conversation_id | INTEGER | - | Identifiant de la conversation | NOT NULL, FOREIGN KEY (conversations.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur qui tape | NOT NULL, FOREIGN KEY (users.id) |
| last_updated | TIMESTAMP | - | Date et heure de dernière mise à jour | DEFAULT CURRENT_TIMESTAMP |

### Description
Cette table garde trace des utilisateurs qui sont en train de taper un message dans une conversation. Les entrées sont éphémères et mises à jour fréquemment.

### Règles métier
- Un utilisateur ne peut avoir qu'un seul statut de frappe par conversation
- L'utilisateur doit être un participant de la conversation
- Le statut de frappe est considéré comme actif si last_updated est dans les 5 dernières secondes
- Les entrées plus anciennes que 5 secondes sont considérées comme expirées
- Une tâche de nettoyage périodique peut supprimer les entrées expirées

## Table: read_receipts
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| message_id | INTEGER | - | Identifiant du message | NOT NULL, FOREIGN KEY (instant_messages.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur qui a lu | NOT NULL, FOREIGN KEY (users.id) |
| read_at | TIMESTAMP | - | Date et heure de lecture | DEFAULT CURRENT_TIMESTAMP |

### Description
Cette table enregistre quand chaque utilisateur a lu un message spécifique, permettant d'afficher les accusés de lecture.

### Règles métier
- Un utilisateur ne peut avoir qu'un seul accusé de lecture par message
- L'utilisateur doit être un participant de la conversation contenant le message
- L'utilisateur ne peut pas marquer comme lu ses propres messages
- La suppression d'un message entraîne la suppression de tous ses accusés de lecture (ON DELETE CASCADE)

## Relations et Contraintes d'Intégrité

1. **Contrainte d'unicité pour les conversations privées**:
   ```sql
   CREATE UNIQUE INDEX idx_private_conversations ON conversation_participants (user_id, conversation_id) 
   WHERE (SELECT is_group FROM conversations WHERE id = conversation_id) = 0;
   ```

2. **Contrainte pour vérifier la référence de message**:
   ```sql
   CREATE TRIGGER check_reference_message 
   BEFORE INSERT ON instant_messages
   FOR EACH ROW
   WHEN NEW.reference_message_id IS NOT NULL
   BEGIN
     SELECT RAISE(ABORT, 'Referenced message must be in the same conversation')
     WHERE (SELECT conversation_id FROM instant_messages WHERE id = NEW.reference_message_id) != NEW.conversation_id;
   END;
   ```

3. **Contrainte pour vérifier que l'expéditeur est un participant**:
   ```sql
   CREATE TRIGGER check_sender_is_participant
   BEFORE INSERT ON instant_messages
   FOR EACH ROW
   BEGIN
     SELECT RAISE(ABORT, 'Sender must be a participant of the conversation')
     WHERE NOT EXISTS (SELECT 1 FROM conversation_participants 
                       WHERE conversation_id = NEW.conversation_id AND user_id = NEW.sender_id);
   END;
   ```

4. **Index pour optimiser les recherches**:
   ```sql
   CREATE INDEX idx_messages_by_conversation ON instant_messages(conversation_id, created_at);
   CREATE INDEX idx_messages_by_sender ON instant_messages(sender_id, created_at);
   CREATE INDEX idx_messages_by_reference ON instant_messages(reference_message_id);
   ```