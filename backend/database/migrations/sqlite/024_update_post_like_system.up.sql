-- Migration pour améliorer le système de likes avec support des dislikes
-- et garantir l'exclusivité (un utilisateur ne peut que liker OU disliker, pas les deux)

-- 1. Créer une nouvelle table temporaire avec la structure mise à jour
CREATE TABLE post_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction_type TEXT NOT NULL CHECK(reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Contrainte unique pour empêcher plusieurs réactions du même utilisateur sur le même post
    UNIQUE(post_id, user_id)
);

-- 2. Copier les données existantes de post_like vers post_reactions
-- Toutes les entrées existantes sont considérées comme des "likes"
INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
SELECT post_id, user_id, 'like', created_at
FROM post_like;

-- 3. Supprimer l'ancienne table
DROP TABLE post_like;

-- 4. Renommer la nouvelle table
ALTER TABLE post_reactions RENAME TO post_like;

-- 5. Créer des index pour optimiser les requêtes
CREATE INDEX idx_post_like_post_id ON post_like(post_id);
CREATE INDEX idx_post_like_user_id ON post_like(user_id);
CREATE INDEX idx_post_like_reaction_type ON post_like(reaction_type);