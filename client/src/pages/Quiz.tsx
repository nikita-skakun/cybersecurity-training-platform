import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserData } from "../util/api_utils.ts";
import { TitleBar } from "../util/screen_utils.tsx";
import { useNavigate } from "react-router-dom";

interface Question {
	question: string;
	type: "single";
	options: string[];
}

interface Quiz {
	title: string;
	questions: Question[];
}

export default function Quiz() {
	const { id } = useParams<{ id: string }>();
	const user = useUserData();
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
	const [score, setScore] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`/api/quizzes/${id}`)
			.then((res) => res.json())
			.then((data) => setQuiz(data.quiz))
			.catch((err) => console.error("Failed to load quiz:", err));
	}, [id]);

	if (!quiz) return <div>Loading...</div>;

	const currentQuestion = quiz.questions[currentQuestionIndex];

	const handleNext = () => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			fetch(`/api/quizzes/${id}/mark`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(answers),
			})
				.then((res) => res.json())
				.then((data) => setScore(data.score))
				.catch((err) => console.error("Failed to submit answers:", err));
		}
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

	if (score !== null) {
		return (
			<div className="page-container">
				<TitleBar user={user} />
				<main className="fullsize-content">
					<h2>{quiz.title}</h2>
					<h3>Quiz Completed!</h3>
					<p>
						Your Score: <strong>{score}%</strong>
					</p>
					<button onClick={() => globalThis.location.reload()}>
						Try Again
					</button>
					<button onClick={() => navigate("/")}>
						<img src="/icons/back_icon.svg" className="icon" />
						Home
					</button>{" "}
				</main>
			</div>
		);
	}

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="fullsize-content">
				<h2>{quiz.title}</h2>
				<h3>{currentQuestion.question}</h3>
				<div className="options-container">
					{currentQuestion.options.map((option: string) => (
						<label key={option}>
							<input
								type={currentQuestion.type === "single" ? "radio" : "checkbox"}
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
				<button onClick={handleNext}>
					{currentQuestionIndex < quiz.questions.length - 1 ? "Next" : "Submit"}
				</button>
			</main>
		</div>
	);
}
