import Database from "better-sqlite3";

const db = loadOrCreateDatabase();
console.log("Database loaded successfully.");

export function loadOrCreateDatabase(): Database {
	const db = new Database("database.db");
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON");

	// Create the user table if it don't exist
	db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT NOT NULL,
            username TEXT NOT NULL,
            UNIQUE(domain, username)
        );
    `);

	// Create the completed requirements table if it don't exist
	db.exec(`
        CREATE TABLE IF NOT EXISTS completed (
            user_id INTEGER NOT NULL,
            requirement TEXT NOT NULL,
            first_at TEXT NOT NULL,
            last_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

	// Create the quiz results table if it don't exist
	db.exec(`
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id TEXT NOT NULL,
            score INTEGER NOT NULL,
            completed_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

	return db;
}

// Find or add user to the database
export function findOrCreateUser(domain: string, username: string): number {
	const user = db
		.prepare("SELECT id FROM users WHERE domain = ? AND username = ?")
		.get(domain, username);
	if (user) {
		return user.id;
	} else {
		const stmt = db.prepare(
			"INSERT INTO users (domain, username) VALUES (?, ?)"
		);
		const result = stmt.run(domain, username);
		return result.lastInsertRowid;
	}
}

export function closeDatabase(): void {
	try {
		db.close();
		console.log("Database closed successfully.");
	} catch (error) {
		console.error("Error closing database:", error);
	}
}
