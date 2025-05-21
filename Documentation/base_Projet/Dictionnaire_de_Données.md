# Dictionnaire de Données

## Système Commun

### Table: users
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de l'utilisateur | PRIMARY KEY, AUTOINCREMENT |
| email | TEXT | - | Adresse email de l'utilisateur | NOT NULL, UNIQUE |
| password_hash | TEXT | - | Hash du mot de passe | NOT NULL |
| first_name | TEXT | - | Prénom de l'utilisateur | NOT NULL |
| last_name | TEXT | - | Nom de famille de l'utilisateur | NOT NULL |
| birth_date | DATE | - | Date de naissance | NOT NULL |
| avatar_path | TEXT | - | Chemin vers l'avatar/image de profil | NULL |
| username | TEXT | - | Surnom de l'utilisateur | NULL |
| about_me | TEXT | - | Description personnelle | NULL |
| is_public | BOOLEAN | - | Indique si le profil est public (TRUE) ou privé (FALSE) | DEFAULT FALSE |
| online_status | BOOLEAN | - | Indique si l'utilisateur est en ligne | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création du compte | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | - | Date et heure de dernière mise à jour | DEFAULT CURRENT_TIMESTAMP |

### Table: follows
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| follower_id | INTEGER | - | Identifiant de l'utilisateur qui suit | NOT NULL, FOREIGN KEY (users.id) |
| followed_id | INTEGER | - | Identifiant de l'utilisateur suivi | NOT NULL, FOREIGN KEY (users.id) |
| is_accepted | BOOLEAN | - | Indique si la demande de suivi a été acceptée | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: sessions
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la session | PRIMARY KEY, AUTOINCREMENT |
| user_id | INTEGER | - | Identifiant de l'utilisateur | NOT NULL, FOREIGN KEY (users.id) |
| token | TEXT | - | Jeton d'authentification | NOT NULL, UNIQUE |
| expires_at | TIMESTAMP | - | Date et heure d'expiration | NOT NULL |
| client_id | TEXT | - | Identifiant du client (pour multi-clients) | NULL |
| device_info | TEXT | - | Informations sur l'appareil | NULL |

### Table: notifications
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la notification | PRIMARY KEY, AUTOINCREMENT |
| user_id | INTEGER | - | Identifiant du destinataire | NOT NULL, FOREIGN KEY (users.id) |
| type | INTEGER | - | Type de notification (1: follow, 2: group, 3: event, 4: message, etc.) | NOT NULL |
| reference_id | INTEGER | - | Identifiant de référence (selon le type) | NOT NULL |
| reference_type | TEXT | - | Type de référence ('follow', 'group', 'event', 'message', etc.) | NOT NULL |
| is_read | BOOLEAN | - | Indique si la notification a été lue | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

## Système de Publications Classique

### Table: posts
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la publication | PRIMARY KEY, AUTOINCREMENT |
| user_id | INTEGER | - | Identifiant de l'auteur | NOT NULL, FOREIGN KEY (users.id) |
| content | TEXT | - | Contenu textuel de la publication | NOT NULL |
| image_path | TEXT | - | Chemin vers l'image associée | NULL |
| privacy_type | INTEGER | - | Type de confidentialité (0: public, 1: almost private, 2: private) | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | - | Date et heure de dernière mise à jour | DEFAULT CURRENT_TIMESTAMP |

### Table: comments
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique du commentaire | PRIMARY KEY, AUTOINCREMENT |
| post_id | INTEGER | - | Identifiant de la publication commentée | NOT NULL, FOREIGN KEY (posts.id) |
| user_id | INTEGER | - | Identifiant de l'auteur du commentaire | NOT NULL, FOREIGN KEY (users.id) |
| content | TEXT | - | Contenu textuel du commentaire | NOT NULL |
| image_path | TEXT | - | Chemin vers l'image associée | NULL |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: post_privacy
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| post_id | INTEGER | - | Identifiant de la publication | NOT NULL, FOREIGN KEY (posts.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur autorisé | NOT NULL, FOREIGN KEY (users.id) |

### Table: groups
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique du groupe | PRIMARY KEY, AUTOINCREMENT |
| creator_id | INTEGER | - | Identifiant du créateur du groupe | NOT NULL, FOREIGN KEY (users.id) |
| title | TEXT | - | Titre du groupe | NOT NULL |
| description | TEXT | - | Description du groupe | NOT NULL |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: group_members
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| group_id | INTEGER | - | Identifiant du groupe | NOT NULL, FOREIGN KEY (groups.id) |
| user_id | INTEGER | - | Identifiant du membre | NOT NULL, FOREIGN KEY (users.id) |
| is_accepted | BOOLEAN | - | Indique si la demande/invitation a été acceptée | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: group_posts
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la publication de groupe | PRIMARY KEY, AUTOINCREMENT |
| group_id | INTEGER | - | Identifiant du groupe | NOT NULL, FOREIGN KEY (groups.id) |
| user_id | INTEGER | - | Identifiant de l'auteur | NOT NULL, FOREIGN KEY (users.id) |
| content | TEXT | - | Contenu textuel de la publication | NOT NULL |
| image_path | TEXT | - | Chemin vers l'image associée | NULL |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: group_comments
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique du commentaire | PRIMARY KEY, AUTOINCREMENT |
| group_post_id | INTEGER | - | Identifiant de la publication de groupe | NOT NULL, FOREIGN KEY (group_posts.id) |
| user_id | INTEGER | - | Identifiant de l'auteur | NOT NULL, FOREIGN KEY (users.id) |
| content | TEXT | - | Contenu textuel du commentaire | NOT NULL |
| image_path | TEXT | - | Chemin vers l'image associée | NULL |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: events
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de l'événement | PRIMARY KEY, AUTOINCREMENT |
| group_id | INTEGER | - | Identifiant du groupe | NOT NULL, FOREIGN KEY (groups.id) |
| creator_id | INTEGER | - | Identifiant du créateur | NOT NULL, FOREIGN KEY (users.id) |
| title | TEXT | - | Titre de l'événement | NOT NULL |
| description | TEXT | - | Description de l'événement | NOT NULL |
| event_time | DATETIME | - | Date et heure de l'événement | NOT NULL |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: event_options
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de l'option | PRIMARY KEY, AUTOINCREMENT |
| event_id | INTEGER | - | Identifiant de l'événement | NOT NULL, FOREIGN KEY (events.id) |
| option_text | TEXT | - | Texte de l'option (ex: "Participe", "Ne participe pas") | NOT NULL |

### Table: event_responses
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la réponse | PRIMARY KEY, AUTOINCREMENT |
| event_id | INTEGER | - | Identifiant de l'événement | NOT NULL, FOREIGN KEY (events.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur | NOT NULL, FOREIGN KEY (users.id) |
| option_id | INTEGER | - | Identifiant de l'option choisie | NOT NULL, FOREIGN KEY (event_options.id) |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

## Système de Messagerie Instantanée

### Table: conversations
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique de la conversation | PRIMARY KEY, AUTOINCREMENT |
| name | TEXT | - | Nom de la conversation (pour les groupes) | NULL |
| is_group | BOOLEAN | - | Indique s'il s'agit d'une conversation de groupe | DEFAULT FALSE |
| created_at | TIMESTAMP | - | Date et heure de création | DEFAULT CURRENT_TIMESTAMP |

### Table: conversation_participants
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| conversation_id | INTEGER | - | Identifiant de la conversation | NOT NULL, FOREIGN KEY (conversations.id) |
| user_id | INTEGER | - | Identifiant du participant | NOT NULL, FOREIGN KEY (users.id) |
| joined_at | TIMESTAMP | - | Date et heure d'ajout à la conversation | DEFAULT CURRENT_TIMESTAMP |

### Table: instant_messages
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

### Table: typing_status
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| conversation_id | INTEGER | - | Identifiant de la conversation | NOT NULL, FOREIGN KEY (conversations.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur qui tape | NOT NULL, FOREIGN KEY (users.id) |
| last_updated | TIMESTAMP | - | Date et heure de dernière mise à jour | DEFAULT CURRENT_TIMESTAMP |

### Table: read_receipts
| Nom du champ | Type | Taille | Description | Contraintes |
|--------------|------|--------|-------------|-------------|
| id | INTEGER | - | Identifiant unique | PRIMARY KEY, AUTOINCREMENT |
| message_id | INTEGER | - | Identifiant du message | NOT NULL, FOREIGN KEY (instant_messages.id) |
| user_id | INTEGER | - | Identifiant de l'utilisateur qui a lu | NOT NULL, FOREIGN KEY (users.id) |
| read_at | TIMESTAMP | - | Date et heure de lecture | DEFAULT CURRENT_TIMESTAMP |