import { Router } from "jsr:@oak/oak";
import { Quiz, UserAnswers } from "@shared/types/quiz.ts";
import { ItemInfo } from "@shared/types/item.ts";
import { User } from "@shared/types/user.ts";
import { verifyToken } from "../util/jwt_utils.ts";
import { getJson } from "../util/fs_utils.ts";
import {
	listCompletedRequirementsByType,
	markRequirementCompleted,
	storeQuizResult,
} from "../util/db_utils.ts";

const quizInfoCache: Record<string, ItemInfo> = {};
const quizCache: Record<string, Quiz> = {};

const PASSING_SCORE = 70;

const quizRouter = new Router();

async function fetchQuiz(id: string): Promise<Quiz> {
	let quiz: Quiz;
	if (quizCache[id]) {
		quiz = quizCache[id];
	} else {
		const filePath = `./quiz/${id}.json`;

		quiz = (await getJson(filePath)) as Quiz;
		quizCache[id] = quiz;
	}
	return quiz;
}

async function fetchQuizList(): Promise<Record<string, ItemInfo>> {
	if (Object.keys(quizInfoCache).length === 0) {
		for await (const entry of Deno.readDir("./quiz")) {
			if (entry.isFile && entry.name.endsWith(".json")) {
				const id = entry.name.replace(".json", "");
				const quiz = await fetchQuiz(id);
				const quizInfo: ItemInfo = quiz.info;
				quizInfoCache[id] = quizInfo;
			}
		}
	}
	return quizInfoCache;
}

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function checkAnswers(quiz: Quiz, userAnswers: UserAnswers): number {
	let totalPointsEarned = 0;
	let totalPossiblePoints = 0;

	quiz.questions.forEach((question, index) => {
		const correctAnswer = question.answer;
		if (!correctAnswer) return;

		totalPossiblePoints += 1;

		const userAnswer = userAnswers[index];

		if (question.type === "single") {
			if (typeof userAnswer !== "string" || typeof correctAnswer !== "string")
				return;

			if (userAnswer === correctAnswer) {
				totalPointsEarned += 1;
			}
		} else if (question.type === "multiple") {
			if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return;

			const correctSet = new Set(correctAnswer);
			const userSet = new Set(userAnswer);

			const correctCount = correctAnswer.length;
			const userCorrectCount = [...userSet].filter((ans) =>
				correctSet.has(ans)
			).length;
			const extraAnswers = userSet.size - correctCount;

			let scoreFraction = userCorrectCount / correctCount;
			if (extraAnswers > 0) scoreFraction -= extraAnswers / correctCount;

			totalPointsEarned += Math.max(scoreFraction, 0);
		}
	});

	if (totalPossiblePoints === 0) return 0;
	return Math.round((totalPointsEarned / totalPossiblePoints) * 100);
}

quizRouter.get("/api/quiz/:id", async (context) => {
	const { id } = context.params;

	try {
		const quiz = await fetchQuiz(id);

		const quizForFrontend = {
			...quiz,
			questions: quiz.questions.map(
				({ answer: _answer, options, ...question }) => ({
					...question,
					options: shuffleArray(options),
				})
			),
		};

		context.response.status = 200;
		context.response.body = { success: true, quiz: quizForFrontend };
	} catch (error) {
		console.error("Error loading quiz file:", error);
		context.response.status = 404;
		context.response.body = { success: false, message: "Quiz not found" };
	}
});

quizRouter.post("/api/quiz/:id/mark", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);

	if (!payload) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	const userId = payload.id;
	const { id } = context.params;

	try {
		const quiz = await fetchQuiz(id);

		const userAnswers: UserAnswers = await context.request.body.json();
		const score = checkAnswers(quiz, userAnswers);

		storeQuizResult(userId, id, score);
		if (score >= PASSING_SCORE) {
			markRequirementCompleted(userId, id, "quiz");
		}

		context.response.status = 200;
		context.response.body = {
			success: true,
			score,
			pass: score >= PASSING_SCORE,
		};
	} catch (error) {
		console.error("Error loading quiz file:", error);
		context.response.status = 404;
		context.response.body = { success: false, message: "Quiz not found" };
	}
});

quizRouter.get("/api/quiz", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");

	const payload = verifyToken<User>(token);

	if (!payload) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	try {
		const avlQuizzes = await fetchQuizList();
		const compQuizIdList = listCompletedRequirementsByType(payload.id, "quiz");

		const compQuizzes: Record<string, ItemInfo> = {};
		for (const quizId of compQuizIdList) {
			if (avlQuizzes[quizId]) {
				compQuizzes[quizId] = avlQuizzes[quizId];
				delete avlQuizzes[quizId];
			}
		}

		context.response.status = 200;
		context.response.body = { success: true, avlQuizzes, compQuizzes };
	} catch (error) {
		console.error("Error listing quizzes:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Failed to list quizzes",
		};
	}
});

export default quizRouter;
