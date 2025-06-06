CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	conversation_id INTEGER NOT NULL,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	group_id INTEGER,
	content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	read_at TIMESTAMP,
	FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
	CHECK (sender_id != receiver_id)
);