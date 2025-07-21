CREATE TABLE IF NOT EXISTS event_responses (
	event_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	status TEXT NOT NULL CHECK(status IN ('going', 'not_going')),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (event_id, user_id),
	FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
