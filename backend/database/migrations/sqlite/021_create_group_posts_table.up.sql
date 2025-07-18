CREATE TABLE IF NOT EXISTS group_posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	group_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	username TEXT NOT NULL CHECK (length(username) BETWEEN 1 AND 50),
	content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
	image_path TEXT CHECK (length(image_path) <= 255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
