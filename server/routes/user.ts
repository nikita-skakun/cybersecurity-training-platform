import { Router } from "jsr:@oak/oak";
import { verifyToken } from "../util/jwt_utils.ts";
import { AdminUserInfo, User } from "@shared/types/user.ts";
import { domainConfigs } from "../util/ldap.ts";
import { Client } from "ldapts";
import {
	findUserId,
	getAverageScore,
	getPhishingClickedCount,
	getPhishingSentCount,
	listCompletedRequirementsByType,
	updatePhishingEmailClicked,
} from "../util/db_utils.ts";
import { sendPhishingEmail } from "../util/mail.ts";

const userRouter = new Router();

userRouter.get("/api/userData", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");

	const payload = verifyToken<User>(token);
	if (payload) {
		context.response.status = 200;
		context.response.body = {
			success: true,
			message: "Protected content",
			user: payload,
		};
	} else {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
	}
});

// get company users if user is admin
userRouter.get("/api/companyUsers", async (context) => {
	let client: Client | null = null;

	try {
		// Authenticate and authorize
		const token = await context.cookies.get("jwtCyberTraining");
		const payload = verifyToken<User>(token);

		if (!payload || payload.role !== "admin") {
			context.response.status = 403;
			context.response.body = { success: false, message: "Invalid token" };
			return;
		}

		// Get domain configuration
		const domainConfig = domainConfigs[payload.baseDN];
		if (!domainConfig) {
			context.response.status = 500;
			context.response.body = { success: false, message: "Invalid domain" };
			return;
		}

		// Connect to LDAP
		client = new Client({ url: domainConfig.url });
		await client.bind(domainConfig.bindDN, domainConfig.bindPassword);

		// Fetch group members
		const { searchEntries: groupEntries } = await client.search(
			domainConfig.userGroupDN
		);

		const memberDNs = groupEntries[0]?.uniquemember;
		if (!Array.isArray(memberDNs) || memberDNs.length === 0) {
			context.response.status = 404;
			context.response.body = { success: false, message: "No users found" };
			return;
		}

		// Search all users from member DN
		const users: AdminUserInfo[] = [];

		for (const userDN of memberDNs) {
			const userDNStr = userDN.toString();

			const { searchEntries: userEntries } = await client.search(userDNStr, {
				scope: "base",
				attributes: ["uid", "cn"],
			});

			const entry = userEntries[0];
			if (!entry?.uid) continue;

			const username = entry.uid.toString();
			const name = entry.cn?.toString() || "";
			const id = findUserId(payload.domain, username) ?? -1;

			let compQuizzes, compModules, avgScore, phishingSent, phishingClicked;

			if (id >= 0) {
				compQuizzes = listCompletedRequirementsByType(id, "quiz").length;
				compModules = listCompletedRequirementsByType(id, "module").length;
				avgScore = getAverageScore(id);
				phishingSent = getPhishingSentCount(id);
				phishingClicked = getPhishingClickedCount(id);
			}

			users.push({
				username,
				id,
				name,
				compQuizzes,
				compModules,
				avgScore,
				phishingSent,
				phishingClicked,
			});
		}

		// Respond with user data
		context.response.status = 200;
		context.response.body = {
			success: true,
			users,
		};
	} catch (error) {
		console.error("Error fetching company users:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Internal server error",
		};
	} finally {
		// Always unbind LDAP client
		if (client) {
			try {
				await client.unbind();
			} catch (unbindError) {
				console.error("Error unbinding LDAP client:", unbindError);
			}
		}
	}
});

// Send phishing email to user
userRouter.post("/api/sendPhishingEmail", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);

	if (!payload || payload.role !== "admin") {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}
	const jsonData = await context.request.body?.json();
	if (!jsonData) {
		context.response.status = 400;
		context.response.body = { success: false, message: "Invalid request body" };
		return;
	}
	const { username, name, userId } = jsonData as {
		username: string;
		name: string;
		userId: number;
	};

	if (!username || !name || !userId) {
		context.response.status = 400;
		context.response.body = {
			success: false,
			message: "Username, name, and user ID are required",
		};
		return;
	}

	const email = username + "@" + payload.domain;
	const company = payload.companyName;

	console.log("Sending phishing email to:", email);

	try {
		await sendPhishingEmail(email, name, company, userId);
		context.response.status = 200;
		context.response.body = { success: true, message: "Email sent" };
	} catch (error) {
		console.error("Error sending email:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Email sending failed",
		};
	}
});

userRouter.post("/api/phishCaught/:uuid", (context) => {
	const uuid = context.params.uuid;

	const userId = updatePhishingEmailClicked(uuid);
	console.log("Phishing simulation caught:", userId);

	context.response.status = 200;
	context.response.body = {
		success: true,
		message: "Phishing simulation caught",
	};
});

export default userRouter;
