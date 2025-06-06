CREATE TABLE IF NOT EXISTS notifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	type TEXT NOT NULL,
	content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
	read BOOLEAN NOT NULL DEFAULT 0,
	reference_id INTEGER,
	reference_type TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);