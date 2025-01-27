import { Client } from "ldapts";
import ldapEscape from "ldap-escape";
import fs from "node:fs";
import * as path from "node:path";

const loadDomainConfigs = (): Record<
  string,
  { url: string; bindDN: string; bindPassword: string; groupDN: string }
> => {
	const currentDir = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
	const configPath = path.resolve(currentDir, "config.json");
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

const loginUser = "test-user1@test-client-ad.com";
const loginPwd = "Password123";

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
	} catch (err) {
		throw new Error(`Failed to bind client for domain key: ${domainKey}`);
	}
};

const validateEmail = (username: string): void => {
	const emailPattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailPattern.test(username)) {
		throw new Error("Invalid username format. Must be a valid email address.");
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

	let baseDN =
		"cn=users," +
		domain
			.split(".")
			.map((part) => "dc=" + ldapEscape.dn`${part}`)
			.join(",");

	return { username, baseDN };
};

const authenticateUser = async (
	loginUser: string,
	loginPwd: string
): Promise<boolean> => {
	try {
		validateEmail(loginUser);
		const { username, baseDN } = extractFromEmail(loginUser);

		const client = await getPersistentBind(baseDN);

		const { searchEntries: userEntries } = await client.search(baseDN, {
			scope: "sub",
			filter: `(samAccountName=${username})`,
			attributes: ["dn"],
		});

		if (userEntries.length === 0) {
			throw new Error(`User ${username} not found in domain ${baseDN}.`);
		}

		const userDN = userEntries[0].dn;
		console.log(`Found user DN: ${userDN}`);

		const userClient = new Client({ url: domainConfigs[baseDN].url });

		try {
			await userClient.bind(userDN, loginPwd);
			console.log(`Password verification successful for ${username}`);
		} catch (err) {
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

		return true;
	} catch (ex) {
		console.error("Authentication error:", ex.message);
	}

	return false;
};

// TODO: Wait for requests here
const isAuthenticated = await authenticateUser(loginUser, loginPwd);
console.log("Authenticated:", isAuthenticated);

for (const client of Object.values(persistentBindList)) {
	client.unbind();
}
