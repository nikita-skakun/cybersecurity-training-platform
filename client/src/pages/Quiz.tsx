import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Quiz } from "@shared/types/quiz.ts";
import {
	Container,
	Paper,
	Box,
	Typography,
	Button,
	CircularProgress,
	LinearProgress,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	Checkbox,
	FormGroup,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";

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

	if (!quiz)
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);

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
	if (isAnswerSelected && Array.isArray(answers[currentQuestionIndex])) {
		isAnswerSelected = (answers[currentQuestionIndex] as string[]).length > 0;
	}

	let progress = (currentQuestionIndex / quiz.questions.length) * 100;
	if (score !== null) progress = 100;

	return (
		<>
			<TitleBar user={user} />
			<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
					{/* Progress Bar */}
					<Box sx={{ width: "100%", mb: 3 }}>
						<LinearProgress variant="determinate" value={progress} />
					</Box>

					<Typography variant="h4" align="center" gutterBottom>
						{quiz.info.title}
					</Typography>

					{score !== null ? (
						<Box sx={{ textAlign: "center" }}>
							<Typography variant="h5" gutterBottom>
								Quiz Completed!
							</Typography>
							<Typography variant="body1" gutterBottom>
								Your Score: <strong>{score}%</strong>
							</Typography>
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									gap: 2,
									mt: 3,
								}}
							>
								<Button
									variant="outlined"
									color="primary"
									onClick={() => globalThis.location.reload()}
									startIcon={<ReplayIcon />}
								>
									Try Again
								</Button>
								<Button
									variant="contained"
									color="primary"
									onClick={() => navigate("/")}
									startIcon={<HomeIcon />}
								>
									Home
								</Button>
							</Box>
						</Box>
					) : (
						<>
							<Typography variant="h5" align="center" gutterBottom>
								{currentQuestion.question}
							</Typography>
							<Box sx={{ mt: 3, mb: 3 }}>
								{currentQuestion.type === "single" ? (
									<FormControl component="fieldset">
										<RadioGroup
											name={`question-${currentQuestionIndex}`}
											value={answers[currentQuestionIndex] || ""}
											onChange={(e) => handleAnswerChange(e.target.value)}
										>
											{currentQuestion.options.map((option: string) => (
												<FormControlLabel
													key={option}
													value={option}
													control={<Radio />}
													label={option}
												/>
											))}
										</RadioGroup>
									</FormControl>
								) : (
									<FormControl component="fieldset">
										<FormGroup>
											{currentQuestion.options.map((option: string) => (
												<FormControlLabel
													key={option}
													control={
														<Checkbox
															checked={
																(
																	answers[currentQuestionIndex] as string[]
																)?.includes(option) || false
															}
															onChange={() => handleAnswerChange(option)}
														/>
													}
													label={option}
												/>
											))}
										</FormGroup>
									</FormControl>
								)}
							</Box>
							<Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
								<Button
									variant="contained"
									onClick={handleBack}
									disabled={currentQuestionIndex === 0}
									startIcon={<ChevronLeftIcon />}
								>
									Previous
								</Button>
								{currentQuestionIndex < quiz.questions.length - 1 ? (
									<Button
										variant="contained"
										onClick={handleNext}
										disabled={!isAnswerSelected}
										endIcon={<ChevronRightIcon />}
									>
										Next
									</Button>
								) : (
									<Button
										variant="contained"
										onClick={handleSubmit}
										disabled={!isAnswerSelected}
										endIcon={<ChevronRightIcon />}
									>
										Submit
									</Button>
								)}
							</Box>
						</>
					)}
				</Paper>
			</Container>
		</>
	);
}
