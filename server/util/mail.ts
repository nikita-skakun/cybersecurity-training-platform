import path from "node:path";
import fs from "node:fs";
import nodemailer from "nodemailer";
import handlebars from "handlebars";

export interface MailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

// Load transport configuration from config.json
const loadMailConfig = (): MailConfig | null => {
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
};

const mailConfig = loadMailConfig();

const templatePath = path.resolve(
	"phishing_template/employee_survey_template.hbs"
);
const templateSource = fs.readFileSync(templatePath, "utf-8");
const template = handlebars.compile(templateSource);

export async function sendEmail(
	email: string,
	name: string,
	from: string,
	company: string,
	link: string,
	subject: string
) {
	if (!mailConfig) {
		throw new Error(
			"Mail configuration is not available. Skipping email sending."
		);
	}

	const transporter = nodemailer.createTransport(mailConfig);

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
		from,
		to: email,
		subject,
		html: template(templateData),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Message sent: %s", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error);
	}
}
