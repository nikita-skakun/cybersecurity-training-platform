import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ItemInfo } from "@shared/types/item.ts";

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
      type TEXT NOT NULL,
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

// List all completed requirements for a user
export function listCompletedRequirements(userId: number): string[] {
	return [
		...db.query("SELECT requirement FROM completed WHERE user_id = ?", [
			userId,
		]),
	].map((row) => row[0] as string);
}

// List all completed requirements by type for a user
export function listCompletedRequirementsByType(
	userId: number,
	type: string
): string[] {
	return [
		...db.query(
			"SELECT requirement FROM completed WHERE user_id = ? AND type = ?",
			[userId, type]
		),
	].map((row) => row[0] as string);
}

// Filter all elements that have all requirements completed for a user
export function filterUnlockedItems(
	userId: number,
	items: Record<string, ItemInfo>
): Record<string, ItemInfo> {
	const completedRequirements = new Set(listCompletedRequirements(userId));

	return Object.fromEntries(
		Object.entries(items).filter(([_, item]) =>
			item.requirements.every((req) => completedRequirements.has(req))
		)
	);
}

// Mark a requirement as completed for a user
export function markRequirementCompleted(
	userId: number,
	requirement: string,
	type: string
): void {
	const now = new Date().toISOString();

	const rows = [
		...db.query(
			"SELECT first_at FROM completed WHERE user_id = ? AND requirement = ? AND type = ?",
			[userId, requirement, type]
		),
	];
	if (rows.length > 0) {
		db.query(
			"UPDATE completed SET last_at = ? WHERE user_id = ? AND requirement = ? AND type = ?",
			[now, userId, requirement, type]
		);
		return;
	}

	db.query(
		"INSERT INTO completed (user_id, requirement, type, first_at, last_at) VALUES (?, ?, ?, ?, ?)",
		[userId, requirement, type, now, now]
	);
}

// Store a quiz result for a user
export function storeQuizResult(
	userId: number,
	quizId: string,
	score: number
): void {
	const now = new Date().toISOString();

	db.query(
		"INSERT INTO results (user_id, quiz_id, score, completed_at) VALUES (?, ?, ?, ?)",
		[userId, quizId, score, now]
	);
}

export function closeDatabase(): void {
	try {
		db.close();
		console.log("Database closed successfully.");
	} catch (error) {
		console.error("Error closing database:", error);
	}
}
