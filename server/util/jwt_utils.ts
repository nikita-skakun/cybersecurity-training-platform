import * as path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import jwt from "jsonwebtoken";

const KEY_PATH = path.resolve("./jwt_key.pem");
const key = loadOrGenerateKey();

function loadOrGenerateKey() {
	if (fs.existsSync(KEY_PATH)) {
		return fs.readFileSync(KEY_PATH, "utf-8");
	} else {
		const newKey = crypto.randomBytes(32).toString("hex");
		fs.writeFileSync(KEY_PATH, newKey, { mode: 0o600 });
		return newKey;
	}
}

export function generateToken<T extends string | object>(payload: T): string {
	return jwt.sign(payload, key, {
		algorithm: "HS256",
		expiresIn: "1d",
	});
}

export function verifyToken<T>(token: string | undefined): T | null {
	if (!token) {
		return null;
	}
	try {
		const decoded = jwt.verify(token, key);
		if (typeof decoded === "object" && decoded !== null) {
			return decoded as T;
		}
		return null;
	} catch {
		return null;
	}
}
