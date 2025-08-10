-- Rollback de la migration du système de likes/dislikes
-- Retour à la structure originale avec uniquement les likes

-- 1. Créer l'ancienne structure de table
CREATE TABLE post_like_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Copier uniquement les likes (pas les dislikes)
INSERT INTO post_like_old (post_id, user_id, created_at)
SELECT post_id, user_id, created_at
FROM post_like
WHERE reaction_type = 'like';

-- 3. Supprimer la table actuelle
DROP TABLE post_like;

-- 4. Renommer l'ancienne table
ALTER TABLE post_like_old RENAME TO post_like;

-- 5. Recréer les index originaux si nécessaire
CREATE INDEX idx_post_like_post_id ON post_like(post_id);
CREATE INDEX idx_post_like_user_id ON post_like(user_id);