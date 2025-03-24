import path from "node:path";
import fs from "node:fs";

export interface LdapConfig {
	url: string;
	bindDN: string;
	bindPassword: string;
	userGroupDN: string;
	adminGroupDN: string;
	companyName: string;
}

export const allowTestUser = Deno.args.includes("--allow-test-user");

const loadDomainConfigs = (): Record<string, LdapConfig> => {
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

export const domainConfigs = allowTestUser ? {} : loadDomainConfigs();
