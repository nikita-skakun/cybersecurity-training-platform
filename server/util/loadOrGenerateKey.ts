import * as path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

const KEY_PATH = path.resolve("./jwt_key.pem");

export default function loadOrGenerateKey() {
	if (fs.existsSync(KEY_PATH)) {
		return fs.readFileSync(KEY_PATH, "utf-8");
	} else {
		const newKey = crypto.randomBytes(32).toString("hex");
		fs.writeFileSync(KEY_PATH, newKey, { mode: 0o600 });
		return newKey;
	}
}
