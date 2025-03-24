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

	// Create the phishing emails table if it doesn't exist
	db.execute(`
	CREATE TABLE IF NOT EXISTS phishing_emails (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT NOT NULL,
		user_id TEXT NOT NULL,
		created_at TEXT NOT NULL,
		template_name TEXT NOT NULL,
		clicked_at TEXT
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

export function findUserId(domain: string, username: string): number {
	const rows = [
		...db.query("SELECT id FROM users WHERE domain = ? AND username = ?", [
			domain,
			username,
		]),
	];
	if (rows.length > 0) {
		return rows[0][0] as number;
	} else {
		return -1;
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

// List all requirements that are unlocked for a user
export function listUnlockedRequirements(
	userId: number,
	items: Record<string, ItemInfo>
): string[] {
	const completedRequirements = new Set(listCompletedRequirements(userId));

	return Object.entries(items)
		.filter(
			([id, item]) =>
				item.requirements.every((req) => completedRequirements.has(req)) &&
				!completedRequirements.has(id)
		)
		.map(([id, _]) => id);
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

// Get average score for a user
export function getAverageScore(userId: number): number {
	const rows = [
		...db.query("SELECT AVG(score) FROM results WHERE user_id = ?", [userId]),
	];
	if (rows.length > 0) {
		const avgScore = rows[0][0] as number;
		return avgScore ?? 0;
	} else {
		return 0;
	}
}

// Create a phishing email entry
export function createPhishingEmail(
	userId: number,
	uuid: string,
	templateName: string
): void {
	const now = new Date().toISOString();
	db.query(
		"INSERT INTO phishing_emails (uuid, user_id, created_at, template_name, clicked_at) VALUES (?, ?, ?, ?, NULL)",
		[uuid, userId, now, templateName]
	);
}

// Update phishing email entry when clicked by uuid
export function updatePhishingEmailClicked(uuid: string): void {
	const now = new Date().toISOString();
	db.query("UPDATE phishing_emails SET clicked_at = ? WHERE uuid = ?", [
		now,
		uuid,
	]);
}

// Get all phishing emails for a user
export function getPhishingEmails(userId: number): {
	templateName: string;
	createdAt: string;
	clickedAt: string | null;
}[] {
	const rows = [
		...db.query(
			"SELECT created_at, template_name, clicked_at FROM phishing_emails WHERE user_id = ?",
			[userId]
		),
	];
	return rows.map((row) => ({
		createdAt: row[0] as string,
		templateName: row[1] as string,
		clickedAt: row[2] ? (row[2] as string) : null,
	}));
}

// Get number of phishing emails sent to a user
export function getPhishingSentCount(userId: number): number {
	const rows = [
		...db.query("SELECT COUNT(*) FROM phishing_emails WHERE user_id = ?", [
			userId,
		]),
	];
	if (rows.length > 0) {
		return rows[0][0] as number;
	} else {
		return 0;
	}
}

// Get number of phishing emails clicked by a user
export function getPhishingClickedCount(userId: number): number {
	const rows = [
		...db.query(
			"SELECT COUNT(*) FROM phishing_emails WHERE user_id = ? AND clicked_at IS NOT NULL",
			[userId]
		),
	];
	if (rows.length > 0) {
		return rows[0][0] as number;
	} else {
		return 0;
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
