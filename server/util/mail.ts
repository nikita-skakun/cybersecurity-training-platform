import path from "node:path";
import fs from "node:fs";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { createPhishingEmail } from "@server/util/db_utils.ts";

export interface MailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

interface TemplateInfo {
	template: HandlebarsTemplateDelegate;
	from: string;
	subject: string;
}

function loadMailConfig(): MailConfig | null {
	try {
		const configPath = path.resolve("config.json");
		if (!fs.existsSync(configPath)) {
			console.log("Configuration file not found. Mail sending is disabled.");
			return null;
		}

		const rawConfig = fs.readFileSync(configPath, "utf-8");
		const parsedConfig = JSON.parse(rawConfig);

		if (!parsedConfig.mail) {
			console.log(
				"Configuration missing 'mail' key. Mail sending is disabled."
			);
			return null;
		}

		return parsedConfig.mail;
	} catch (error) {
		console.error("Error parsing configuration file:", error);
		return null;
	}
}

const mailConfig = loadMailConfig();

function loadTemplate(templateName: string): TemplateInfo | null {
	try {
		const templatePath = path.resolve(`phishing_template/${templateName}.hbs`);
		const templateSource = fs.readFileSync(templatePath, "utf-8");
		const template = handlebars.compile(templateSource);

		let from = "";
		let subject = "";

		switch (templateName) {
			case "docs_sharing_template":
				from = `Google Docs <${mailConfig?.auth.user}>`;
				subject = "Document shared with you";
				break;
			case "employee_survey_template":
				from = `Human Resources Department <${mailConfig?.auth.user}>`;
				subject = "We Value Your Feedback!";
				break;
			case "gift_card_template":
				from = `Human Resources Department <${mailConfig?.auth.user}>`;
				subject = "🎉 You've Been Selected!";
				break;
			case "hr_policy_template":
				from = `Human Resources Department <${mailConfig?.auth.user}>`;
				subject = "Important: Action Required - HR Policy Update";
				break;
			case "login_attempt_template":
				from = `IT Security Team <${mailConfig?.auth.user}>`;
				subject = "Unusual Login Attempt Detected";
				break;
			case "password_expiry_template":
				from = `IT Security Team <${mailConfig?.auth.user}>`;
				subject = "Password Expiry Notification";
				break;
			default:
				console.log(`Unknown template: ${templateName}`);
				return null;
		}

		return {
			template,
			from,
			subject,
		};
	} catch (error) {
		console.error("Error loading template:", error);
		return null;
	}
}

function loadTemplates(): Record<string, TemplateInfo> {
	const templatesDir = path.resolve("phishing_template");
	const templateFiles = fs.readdirSync(templatesDir);
	const templates: Record<string, TemplateInfo> = {};
	templateFiles.forEach((file) => {
		if (file.endsWith(".hbs")) {
			const templateName = file.replace(".hbs", "");
			const templateInfo = loadTemplate(templateName);
			if (templateInfo) {
				templates[templateName] = templateInfo;
			}
		}
	});
	return templates;
}

const templates = loadTemplates();

export async function sendPhishingEmail(
	email: string,
	name: string,
	company: string,
	userId: number
) {
	if (!mailConfig) {
		throw new Error(
			"Mail configuration is not available. Skipping email sending."
		);
	}

	const transporter = nodemailer.createTransport(mailConfig);

	const uuid = crypto.randomUUID();

	// Randomly select a template
	const templateNames = Object.keys(templates);
	const randomIndex = Math.floor(Math.random() * templateNames.length);
	const templateName = templateNames[randomIndex];
	const templateInfo = templates[templateName];

	createPhishingEmail(userId, uuid, templateName);

	const link = `https://echo-shield.com/process/${uuid}`;

	const templateData = {
		name,
		company,
		managerName: "The Manager",
		domain: email.split("@")[1],
		tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		),
		today: new Date().toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
		year: new Date().getFullYear(),
		link,
	};

	const mailOptions = {
		from: templateInfo?.from,
		to: email,
		subject: templateInfo?.subject,
		html: templateInfo?.template(templateData),
	};

	console.log("Sending email:", mailOptions);

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Message sent: %s", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error);
	}
}
