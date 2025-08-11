-- Ajouter le statut 'maybe' aux réponses d'événements
-- SQLite ne supporte pas ALTER TABLE pour modifier les contraintes CHECK
-- Nous devons recréer la table avec la nouvelle contrainte

-- 1. Créer une nouvelle table temporaire avec la contrainte mise à jour
CREATE TABLE event_responses_new (
	event_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	status TEXT NOT NULL CHECK(status IN ('going', 'not_going', 'maybe')),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (event_id, user_id),
	FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Copier les données existantes
INSERT INTO event_responses_new (event_id, user_id, status, created_at)
SELECT event_id, user_id, status, created_at FROM event_responses;

-- 3. Supprimer l'ancienne table
DROP TABLE event_responses;

-- 4. Renommer la nouvelle table
ALTER TABLE event_responses_new RENAME TO event_responses;