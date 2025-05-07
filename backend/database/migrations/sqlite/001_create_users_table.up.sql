CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE CHECK (length(email) <= 255),
	password_hash TEXT NOT NULL CHECK (length(password_hash) >= 60 AND length(password_hash) <= 255),
	first_name TEXT NOT NULL CHECK (length(first_name) <= 255),
	last_name TEXT NOT NULL CHECK (length(last_name) <= 255),
	birth_date DATE NOT NULL,
	avatar_path TEXT CHECK (length(avatar_path) <= 255),
	nickname TEXT UNIQUE CHECK (length(nickname) <= 255),
	about_me TEXT CHECK (length(about_me) <= 255),
	is_public BOOLEAN NOT NULL DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
