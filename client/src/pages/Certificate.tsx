import { useNavigate, useParams } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import CertificateOfCompletion from "../util/Certificate.tsx";
import { TitleBar } from "../util/TitleBar.tsx";
import { useEffect, useState } from "react";
import { ItemInfo } from "@shared/types/item.ts";
import { QuizResult } from "@shared/types/quiz.ts";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function CertificatePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const user = useUserData();

	const [quizInfo, setQuizInfo] = useState<ItemInfo | null>(null);
	const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const [quizResponse, resultsResponse] = await Promise.all([
					fetch(`/api/quiz/${id}`),
					fetch(`/api/quiz/${id}/score`),
				]);

				if (!quizResponse.ok) {
					throw new Error("Quiz info response was not ok");
				}
				const quizData = await quizResponse.json();
				if (quizData.success && quizData.quiz.info) {
					setQuizInfo(quizData.quiz.info);
				} else {
					console.error("Failed to fetch quiz data");
				}

				if (!resultsResponse.ok) {
					throw new Error("Quiz results response was not ok");
				}
				const resultsData = await resultsResponse.json();
				if (resultsData.success && resultsData.score) {
					setQuizResults(resultsData.score);
					setLoading(false);
				} else {
					console.error("Failed to fetch quiz results");
					navigate("/home");
				}
			} catch (error) {
				console.error("Error fetching quiz data:", error);
				navigate("/home");
			}
		}

		if (!quizInfo || !quizResults) {
			fetchData();
		}
	}, [id]);

	return (
		<>
			<TitleBar user={user} />
			{loading ? (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "80vh",
					}}
				>
					<CircularProgress />
				</Box>
			) : (
				<CertificateOfCompletion
					employeeName={user?.name ?? "Unknown"}
					section={quizInfo?.title ?? "Unknown"}
					quizScore={quizResults?.score ?? 0}
				/>
			)}
		</>
	);
}
