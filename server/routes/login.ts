import { Router } from "jsr:@oak/oak";
import { Client } from "npm:ldapts";
import ldapEscape from "npm:ldap-escape";
import fs from "node:fs";
import * as path from "node:path";
import { generateToken } from "../util/jwt_utils.ts";
import { User } from "@shared/types/user.ts";
import { findOrCreateUserId } from "../util/db_utils.ts";

const allowTestUser = Deno.args.includes("--allow-test-user");

const loadDomainConfigs = (): Record<
	string,
	{
		url: string;
		bindDN: string;
		bindPassword: string;
		userGroupDN: string;
		adminGroupDN: string;
	}
> => {
	const configPath = path.resolve("config.json");
	if (!fs.existsSync(configPath)) {
		throw new Error("Configuration file not found.");
	}

	const rawConfig = fs.readFileSync(configPath, "utf-8");
	const parsedConfig = JSON.parse(rawConfig);

	if (!parsedConfig.domains) {
		throw new Error("Invalid configuration format: 'domains' key missing.");
	}

	return parsedConfig.domains;
};

const domainConfigs = loadDomainConfigs();

const validateEmail = (username: string): void => {
	const emailPattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailPattern.test(username)) {
		throw new Error(`Invalid username format for ${username}.`);
	}
};

const extractFromEmail = (
	email: string
): { username: string; baseDN: string } => {
	const parts = email.split("@");
	if (parts.length !== 2) {
		throw new Error("Invalid email address. Cannot extract domain.");
	}

	const username = ldapEscape.dn`${parts[0]}`;
	const domain = parts[1];

	const baseDN =
		"ou=people," +
		domain
			.split(".")
			.map((part) => "dc=" + ldapEscape.dn`${part}`)
			.join(",");

	return { username, baseDN };
};

const authenticateUser = async (
	email: string,
	password: string
): Promise<User | null> => {
	if (allowTestUser && email === "test@example.com" && password === "test") {
		const { username, baseDN } = extractFromEmail(email);
		const domain = email.split("@")[1];
		const id = findOrCreateUserId(domain, username);
		console.log("Test login activated for test@example.com");
		return {
			username,
			name: "Test User",
			baseDN,
			domain,
			role: "user",
			id,
		};
	}

	try {
		validateEmail(email);
		const { username, baseDN } = extractFromEmail(email);

		const userDN = `cn=${username},${baseDN}`;

		const client = new Client({ url: domainConfigs[baseDN].url });

		let name = "";
		let role = "user";

		try {
			await client.bind(userDN, password);
			console.log(`Password verification successful for ${username}`);

			const { searchEntries: groupEntries } = await client.search(
				domainConfigs[baseDN].userGroupDN,
				{
					scope: "sub",
					filter: `(member=${userDN})`,
				}
			);

			if (groupEntries.length <= 0) {
				const { searchEntries: groupEntries } = await client.search(
					domainConfigs[baseDN].adminGroupDN,
					{
						scope: "sub",
						filter: `(member=${userDN})`,
					}
				);

				if (groupEntries.length > 0) {
					role = "admin";
				} else {
					throw new Error(`${username} is not a member of any user group.`);
				}
			}

			const {
				searchEntries: [selfEntry],
			} = await client.search(baseDN);
			name = selfEntry.cn?.toString() || "";
		} catch (_) {
			throw new Error(`Password verification failed for ${username}`);
		} finally {
			await client.unbind();
		}

		const domain = email.split("@")[1];
		const id = findOrCreateUserId(domain, username);
		console.log(`User ${id} authenticated successfully.`);

		return {
			username,
			name,
			baseDN,
			domain,
			role,
			id,
		};
	} catch (ex) {
		console.error("Authentication error:", ex);
	}

	return null;
};

const loginRouter = new Router();

loginRouter.post("/api/login", async (context) => {
	try {
		if (!context.request.hasBody) {
			context.response.status = 400;
			context.response.body = {
				success: false,
				message: "Request body is missing.",
			};
			return;
		}

		const { email, password } = await context.request.body.json();

		if (typeof email !== "string" || typeof password !== "string") {
			context.response.status = 400;
			context.response.body = {
				success: false,
				message: "Invalid request body format.",
			};
			return;
		}

		const loggedInUserInfo = await authenticateUser(email, password);

		if (loggedInUserInfo) {
			const token = generateToken(loggedInUserInfo);

			context.response.headers.set(
				"Set-Cookie",
				`jwtCyberTraining=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
			);

			context.response.status = 200;
			context.response.body = {
				success: true,
				message: "Login successful!",
			};
		} else {
			context.response.status = 401;
			context.response.body = {
				success: false,
				message: "Invalid credentials.",
			};
		}
	} catch (error) {
		context.response.status = 500;
		context.response.body = { success: false, message: "Server error." };
		console.error(error);
	}
});

loginRouter.post("/api/logout", (context) => {
	context.cookies.delete("jwtCyberTraining");
	context.response.status = 200;
	context.response.body = { success: true, message: "Logged out successfully" };
});

export default loginRouter;
