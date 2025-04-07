import { Router } from "jsr:@oak/oak";
import { verifyToken } from "@server/util/jwt_utils.ts";
import { AdminUserInfo, User } from "@shared/types/user.ts";
import { domainConfigs } from "@server/util/ldap.ts";
import { Client } from "ldapts";
import {
	findUserId,
	getAverageScoreForDateRange,
	getUserAverageScore,
	getPhishingClickedCount,
	getPhishingSentCount,
	listCompletedRequirementsByType,
	updatePhishingEmailClicked,
	getQuizResultsForDateRange,
} from "../util/db_utils.ts";
import { sendPhishingEmail } from "../util/mail.ts";
import { getQuizName } from "@server/routes/quiz.ts";

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

async function getAdminUserInfo(
	client: Client,
	username: string,
	baseDN: string,
	domain: string
): Promise<AdminUserInfo | null> {
	const userDN = `uid=${username},${baseDN}`;
	const { searchEntries: userEntries } = await client.search(userDN, {
		scope: "base",
		attributes: ["cn"],
	});

	const entry = userEntries[0];
	if (!entry) return null;

	const name = entry.cn?.toString() || "";
	const id = findUserId(domain, username) ?? -1;

	let compQuizzes, compModules, avgScore, phishingSent, phishingClicked;

	if (id >= 0) {
		compQuizzes = listCompletedRequirementsByType(id, "quiz").length;
		compModules = listCompletedRequirementsByType(id, "module").length;
		avgScore = getUserAverageScore(id);
		phishingSent = getPhishingSentCount(id);
		phishingClicked = getPhishingClickedCount(id);
	}

	return {
		username,
		id,
		name,
		compQuizzes,
		compModules,
		avgScore,
		phishingSent,
		phishingClicked,
	};
}

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

		// Extract usernames from member DNs
		const usernames = memberDNs.map(
			(dn) => dn.toString().split(",")[0].split("=")[1]
		);

		// Fetch all users concurrently
		const users = (
			await Promise.all(
				usernames.map((username) =>
					getAdminUserInfo(client!, username, payload.baseDN, payload.domain)
				)
			)
		).filter((user): user is AdminUserInfo => user !== null); // Remove null values

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

// get user data if user is admin
userRouter.get("/api/userData/:username", async (context) => {
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

		// Fetch user data
		const userData = await getAdminUserInfo(
			client,
			context.params.username,
			payload.baseDN,
			payload.domain
		);

		if (!userData) {
			context.response.status = 404;
			context.response.body = { success: false, message: "User not found" };
			return;
		}

		// Respond with user data
		context.response.status = 200;
		context.response.body = {
			success: true,
			user: userData,
		};
	} catch (error) {
		console.error("Error fetching user data:", error);
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

function calculateWeekRange(dateObj: Date) {
	// Monday as the first day
	const dayIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;

	const startOfWeek = new Date(dateObj);
	startOfWeek.setDate(dateObj.getDate() - dayIndex);
	startOfWeek.setHours(0, 0, 0, 0);

	const endOfWeek = new Date(dateObj);
	endOfWeek.setDate(dateObj.getDate() + (6 - dayIndex));
	endOfWeek.setHours(23, 59, 59, 999);
	return { startOfWeek, endOfWeek };
}

// Get Average Score for All Users for past 7 days
userRouter.get("/api/averageScores/:date", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);
	if (!payload || payload.role !== "admin") {
		context.response.status = 403;

		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	const dateParam = context.params.date;
	if (!dateParam) {
		context.response.status = 400;
		context.response.body = { success: false, message: "Date is required" };
		return;
	}

	const dateObj = new Date(parseInt(dateParam));
	const { startOfWeek } = calculateWeekRange(dateObj);

	const averageScores = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date(startOfWeek);
		date.setDate(startOfWeek.getDate() + i);

		const score = getAverageScoreForDateRange(
			new Date(date.getFullYear(), date.getMonth(), date.getDate()),
			new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
		);
		averageScores.push({
			dayName: date.toLocaleString("default", { weekday: "long" }),
			score,
		});
	}

	context.response.status = 200;
	context.response.body = {
		success: true,
		averageScores,
	};
});

// Get All Scores for All Users for past 7 days
userRouter.get("/api/userScores/:date", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);
	if (!payload || payload.role !== "admin") {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	const dateParam = context.params.date;
	if (!dateParam) {
		context.response.status = 400;
		context.response.body = { success: false, message: "Date is required" };
		return;
	}

	const dateObj = new Date(parseInt(dateParam));
	const { startOfWeek, endOfWeek } = calculateWeekRange(dateObj);

	const userScores = [];
	const results = getQuizResultsForDateRange(startOfWeek, endOfWeek);
	for (const result of results) {
		userScores.push({
			date: result.date,
			score: result.score,
			userName: result.userName,
			quizName: getQuizName(result.quizId),
		});
	}

	context.response.status = 200;
	context.response.body = {
		success: true,
		userScores: userScores,
	};
});

export default userRouter;
