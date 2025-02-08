import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/api_utils.ts";
import { TitleBar } from "../util/screen_utils.tsx";
import { QuizInfo } from "@shared/types/quiz.ts";
import "./Home.css";

export default function HomePage() {
	const user = useUserData();
	const navigate = useNavigate();
	const [quizList, setQuizList] = useState<Record<string, QuizInfo>>({});
	const [compQuizList, setCompQuizList] = useState<Record<string, QuizInfo>>(
		{}
	);

	useEffect(() => {
		async function fetchQuizzes() {
			try {
				const response = await fetch("/api/quiz");
				const data = await response.json();
				if (data.success) {
					setQuizList(data.quizInfoList as Record<string, QuizInfo>);
					setCompQuizList(data.compQuizInfoList as Record<string, QuizInfo>);
				} else {
					console.error("Failed to fetch quizzes:", data.message);
				}
			} catch (error) {
				console.error("Error fetching quizzes:", error);
			}
		}
		fetchQuizzes();
	}, []);

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="fullsize-container">
				<h1>Welcome Home!</h1>
				{Object.keys(quizList).length > 0 && (
					<>
						<h2>Unlocked Quizzes</h2>
						<div className="quiz-cards-container">
							{Object.entries(quizList).map(([quizId, quiz]) => {
								const quizData = quiz as QuizInfo;
								return (
									<div
										className="quiz-card"
										key={quizId}
										onClick={() => navigate(`/quiz/${quizId}`)}
									>
										<h2>{quizData.title}</h2>
										<p>{quizData.description}</p>
										<p>Questions: {quizData.questionCount}</p>
									</div>
								);
							})}
						</div>
					</>
				)}
				{Object.keys(compQuizList).length > 0 && (
					<>
						<h2>Completed Quizzes</h2>
						<div className="quiz-cards-container">
							{Object.entries(compQuizList).map(([quizId, quiz]) => {
								const quizData = quiz as QuizInfo;
								return (
									<div
										className="quiz-card"
										key={quizId}
										onClick={() => navigate(`/quiz/${quizId}`)}
									>
										<h2>{quizData.title}</h2>
										<p>{quizData.description}</p>
										<p>Questions: {quizData.questionCount}</p>
									</div>
								);
							})}
						</div>
					</>
				)}
			</main>
		</div>
	);
}
