import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Quiz } from "@shared/types/quiz.ts";
import "./Quiz.css";

export default function QuizPage() {
	const { id } = useParams<{ id: string }>();
	const user = useUserData();
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
	const [score, setScore] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`/api/quiz/${id}`)
			.then((res) => res.json())
			.then((data) => setQuiz(data.quiz))
			.catch((err) => console.error("Failed to load quiz:", err));
	}, [id]);

	if (!quiz) return <div>Loading...</div>;

	const currentQuestion = quiz.questions[currentQuestionIndex];

	const handleNext = () => {
		if (currentQuestionIndex < quiz.questions.length - 1)
			setCurrentQuestionIndex(currentQuestionIndex + 1);
	};

	const handleBack = () => {
		if (currentQuestionIndex > 0)
			setCurrentQuestionIndex(currentQuestionIndex - 1);
	};

	const handleSubmit = () => {
		fetch(`/api/quiz/${id}/mark`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(answers),
		})
			.then((res) => res.json())
			.then((data) => setScore(data.score))
			.catch((err) => console.error("Failed to submit answers:", err));
	};

	const handleAnswerChange = (option: string) => {
		setAnswers((prev: Record<number, string | string[]>) => {
			const updatedAnswers = { ...prev };
			if (currentQuestion.type === "single") {
				updatedAnswers[currentQuestionIndex] = option;
			} else {
				const selectedOptions =
					(updatedAnswers[currentQuestionIndex] as string[]) || [];
				updatedAnswers[currentQuestionIndex] = selectedOptions.includes(option)
					? selectedOptions.filter((opt: string) => opt !== option)
					: [...selectedOptions, option];
			}
			return updatedAnswers;
		});
	};

	let isAnswerSelected = answers[currentQuestionIndex] !== undefined;
	if (isAnswerSelected && Array.isArray(answers[currentQuestionIndex]))
		isAnswerSelected = (answers[currentQuestionIndex] as string[]).length > 0;

	let progress = (currentQuestionIndex / quiz.questions.length) * 100;
	if (score !== null) progress = 100;

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="shrunk-container">
				<div className="progress-bar-container">
					<div className="progress-bar" style={{ width: `${progress}%` }}></div>
				</div>
				<h2>{quiz.title}</h2>

				{score !== null ? (
					<>
						<h3>Quiz Completed!</h3>
						<p>
							Your Score: <strong>{score}%</strong>
						</p>
						<div className="button-group center margins-all-but-down">
							<button onClick={() => globalThis.location.reload()}>
								<img src="/icons/reload_icon.svg" className="icon" />
								Try Again
							</button>
							<button onClick={() => navigate("/")}>
								<img src="/icons/back_icon.svg" className="icon" />
								Home
							</button>
						</div>
					</>
				) : (
					<>
						<h3>{currentQuestion.question}</h3>
						<div className="options-container">
							{currentQuestion.options.map((option: string) => (
								<label key={option}>
									<input
										type={
											currentQuestion.type === "single" ? "radio" : "checkbox"
										}
										name={`question-${currentQuestionIndex}`}
										value={option}
										checked={
											currentQuestion.type === "single"
												? answers[currentQuestionIndex] === option
												: (answers[currentQuestionIndex] as string[])?.includes(
														option
												  )
										}
										onChange={() => handleAnswerChange(option)}
									/>
									{option}
								</label>
							))}
						</div>
						<div className="button-group center margins-all-but-down">
							<button
								onClick={handleBack}
								disabled={currentQuestionIndex === 0}
							>
								&lt;
							</button>
							<button
								onClick={handleNext}
								disabled={
									!isAnswerSelected ||
									currentQuestionIndex === quiz.questions.length - 1
								}
							>
								&gt;
							</button>
							<button
								onClick={handleSubmit}
								disabled={
									!isAnswerSelected ||
									currentQuestionIndex !== quiz.questions.length - 1
								}
							>
								Submit
							</button>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
