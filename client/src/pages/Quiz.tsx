import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Quiz } from "@shared/types/quiz.ts";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Paper,
	Typography,
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
import PageContainer from "../util/PageContainer.tsx";

export default function QuizPage() {
	const { id } = useParams<{ id: string }>();
	const user = useUserData();
	const navigate = useNavigate();
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
	const [score, setScore] = useState<number | null>(null);

	useEffect(() => {
		fetch(`/api/quiz/${id}`)
			.then((res) => res.json())
			.then((data) => setQuiz(data.quiz))
			.catch((err) => console.error("Failed to load quiz:", err));
	}, [id]);

	if (!quiz) {
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
	}

	const currentQuestion = quiz.questions[currentQuestionIndex];

	const handleNext = () => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const handleBack = () => {
		if (currentQuestionIndex === 0) {
			navigate("/");
		} else {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
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

	return (
		<>
			<TitleBar user={user} />
			<PageContainer sx={{ alignItems: "center", height: "100vh" }} user={user}>
				<Paper
					elevation={4}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						mt: 8,
						p: 4,
						width: score !== null ? "auto" : "100%",
						maxWidth: { xs: "90%", md: "1200px" },
						backdropFilter: "blur(40px)",
						borderRadius: 4,
					}}
				>
					{score !== null ? (
						<>
							<Typography variant="h4" gutterBottom>
								{quiz.info.title}
							</Typography>
							<Typography variant="h5" gutterBottom>
								Quiz Completed!
							</Typography>
							<Typography variant="body1" sx={{ mb: 3 }}>
								Your Score: <strong>{score}%</strong>
							</Typography>
							<Box sx={{ flexGrow: 1 }} />
							<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
								<Button
									variant="outlined"
									onClick={() => globalThis.location.reload()}
									startIcon={<ReplayIcon />}
								>
									Try Again
								</Button>
								<Button
									variant="outlined"
									onClick={() => navigate("/")}
									startIcon={<HomeIcon />}
								>
									Home
								</Button>
							</Box>
						</>
					) : (
						<>
							<Typography variant="h4" gutterBottom>
								{quiz.info.title}
							</Typography>
							<Typography variant="h5" align="center" gutterBottom>
								{currentQuestion.question}
							</Typography>
							{/* <Box sx={{ width: "100%", textAlign: "left", mb: 3 }}>
								{currentQuestion.description && (
									<ReactMarkdown>{currentQuestion.description}</ReactMarkdown>
								)}
							</Box> */}
							<Box sx={{ mb: 3, width: "100%" }}>
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
							<Box sx={{ flexGrow: 1 }} />
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Button
									variant="outlined"
									onClick={handleBack}
									startIcon={<ChevronLeftIcon />}
								>
									{currentQuestionIndex === 0 ? "Home" : "Previous"}
								</Button>
								<Chip
									label={`Question ${currentQuestionIndex + 1} of ${
										quiz.questions.length
									}`}
								/>
								{currentQuestionIndex < quiz.questions.length - 1 ? (
									<Button
										variant="outlined"
										onClick={handleNext}
										disabled={!isAnswerSelected}
										endIcon={<ChevronRightIcon />}
									>
										Next
									</Button>
								) : (
									<Button
										variant="outlined"
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
			</PageContainer>
		</>
	);
}
