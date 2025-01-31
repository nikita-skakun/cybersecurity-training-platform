import { Router } from "jsr:@oak/oak";
import { Client } from "npm:ldapts";
import ldapEscape from "npm:ldap-escape";
import jwt from "npm:jsonwebtoken";
import fs from "node:fs";
import * as path from "node:path";
import loadOrGenerateKey from "../util/jwt_utils.ts";
import { User } from "@shared/types/user.ts";

const signingKey = loadOrGenerateKey();

const loadDomainConfigs = (): Record<
	string,
	{ url: string; bindDN: string; bindPassword: string; groupDN: string }
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

const persistentBindList: Record<string, Client> = {};

const getPersistentBind = async (domainKey: string): Promise<Client> => {
	if (!domainConfigs[domainKey]) {
		throw new Error(`No configuration found for domain key: ${domainKey}`);
	}

	if (persistentBindList[domainKey]) {
		return persistentBindList[domainKey];
	}

	const { url, bindDN, bindPassword } = domainConfigs[domainKey];
	const client = new Client({ url });

	try {
		await client.bind(bindDN, bindPassword);
		console.log(`Successfully bound client for domain key: ${domainKey}`);
		persistentBindList[domainKey] = client;
		return client;
	} catch (_) {
		await client.unbind();
		throw new Error(`Failed to bind client for domain key: ${domainKey}`);
	}
};

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
		"cn=users," +
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
	try {
		validateEmail(email);
		const { username, baseDN } = extractFromEmail(email);

		const client = await getPersistentBind(baseDN);

		const { searchEntries: userEntries } = await client.search(baseDN, {
			scope: "sub",
			filter: `(samAccountName=${username})`,
			attributes: ["dn", "cn"],
		});

		if (userEntries.length === 0) {
			throw new Error(`User ${username} not found in domain ${baseDN}.`);
		}

		const userDN = userEntries[0].dn;
		console.log(`Found user DN: ${userDN}`);

		const userClient = new Client({ url: domainConfigs[baseDN].url });

		try {
			await userClient.bind(userDN, password);
			console.log(`Password verification successful for ${username}`);
		} catch (_) {
			throw new Error(`Password verification failed for ${username}`);
		} finally {
			await userClient.unbind();
		}

		const { searchEntries: groupEntries } = await client.search(
			domainConfigs[baseDN].groupDN,
			{
				scope: "sub",
				filter: `(&(objectClass=group)(member=${userDN}))`,
			}
		);

		if (groupEntries.length > 0) {
			console.log(`${username} is a member of PhishingTest`);
		} else {
			throw new Error(`${username} is not a member of PhishingTest`);
		}

		return {
			username: username,
			name: userEntries[0].cn as string,
			baseDN: baseDN,
			domain: email.split("@")[1],
			role: "user",
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
			const token = jwt.sign(loggedInUserInfo, signingKey, {
				algorithm: "HS256",
				expiresIn: "1d",
			});

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
