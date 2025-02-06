import { DB } from "https://deno.land/x/sqlite/mod.ts";

export function loadOrCreateDatabase(): DB {
	const db = new DB("database.db");

	// Create the users table if it doesn't exist
	db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      username TEXT NOT NULL,
      UNIQUE(domain, username)
    );
  `);

	// Create the completed requirements table if it doesn't exist
	db.execute(`
    CREATE TABLE IF NOT EXISTS completed (
      user_id INTEGER NOT NULL,
      requirement TEXT NOT NULL,
      first_at TEXT NOT NULL,
      last_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

	// Create the quiz results table if it doesn't exist
	db.execute(`
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

const db = loadOrCreateDatabase();

export function findOrCreateUserId(domain: string, username: string): number {
	const rows = [
		...db.query("SELECT id FROM users WHERE domain = ? AND username = ?", [
			domain,
			username,
		]),
	];
	if (rows.length > 0) {
		return rows[0][0] as number;
	} else {
		db.query("INSERT INTO users (domain, username) VALUES (?, ?)", [
			domain,
			username,
		]);
		return db.lastInsertRowId as number;
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
