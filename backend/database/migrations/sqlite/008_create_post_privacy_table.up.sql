CREATE TABLE IF NOT EXISTS post_privacy (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id INTEGER NOT NULL UNIQUE,
	user_id INTEGER NOT NULL UNIQUE,
	privacy_level TEXT NOT NULL CHECK (privacy_level IN ('public', 'followers', 'private')),
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
