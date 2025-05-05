CREATE TABLE IF NOT EXISTS followers (
	follower_id INTEGER NOT NULL,
	followed_id INTEGER NOT NULL,
	accepted BOOLEAN NOT NULL DEFAULT 0,
	followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (follower_id, followed_id),
	FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
	CHECK (follower_id != followed_id)
);
