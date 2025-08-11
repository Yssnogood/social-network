-- Retirer le statut 'maybe' des réponses d'événements
-- Revenir à la contrainte originale avec seulement 'going' et 'not_going'

-- 1. Créer une nouvelle table temporaire avec l'ancienne contrainte
CREATE TABLE event_responses_new (
	event_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	status TEXT NOT NULL CHECK(status IN ('going', 'not_going')),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (event_id, user_id),
	FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Copier les données existantes (convertir 'maybe' en 'not_going')
INSERT INTO event_responses_new (event_id, user_id, status, created_at)
SELECT 
    event_id, 
    user_id, 
    CASE 
        WHEN status = 'maybe' THEN 'not_going'
        ELSE status
    END as status,
    created_at 
FROM event_responses;

-- 3. Supprimer l'ancienne table
DROP TABLE event_responses;

-- 4. Renommer la nouvelle table
ALTER TABLE event_responses_new RENAME TO event_responses;