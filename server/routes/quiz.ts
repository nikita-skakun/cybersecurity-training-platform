import { Router } from "jsr:@oak/oak";
import { Quiz, UserAnswers } from "@shared/types/quiz.ts";

const quizCache: Record<string, Quiz> = {};

async function getJson(filePath: string) {
	return JSON.parse(await Deno.readTextFile(filePath));
}

const quizRouter = new Router();

async function fetchQuiz(id: string) {
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
	const { id } = context.params;

	try {
		const quiz = await fetchQuiz(id);

		const userAnswers: UserAnswers = await context.request.body.json();
		const score = checkAnswers(quiz, userAnswers);

		context.response.status = 200;
		context.response.body = {
			success: true,
			score,
		};
	} catch (error) {
		console.error("Error loading quiz file:", error);
		context.response.status = 404;
		context.response.body = { success: false, message: "Quiz not found" };
	}
});

export default quizRouter;
