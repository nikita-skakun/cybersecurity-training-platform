import { useEffect, useState } from "react";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { ItemInfo } from "@shared/types/item.ts";
import { AdminUserInfo } from "@shared/types/user.ts";
import { QuizResult } from "@shared/types/quiz.ts";
import CardContainer from "../util/CardContainer.tsx";
import UserCardContainer from "../util/UserCardContainer.tsx";
import { Box, Button, Card, Paper, Typography } from "@mui/material";
import {
	areaElementClasses,
	markElementClasses,
} from "@mui/x-charts/LineChart";
import PageContainer from "../util/PageContainer.tsx";
import {
	AreaPlot,
	axisClasses,
	ChartsAxis,
	ChartsTooltip,
	ChartsVoronoiHandler,
	Gauge,
	gaugeClasses,
	LinePlot,
	MarkPlot,
	ResponsiveChartContainer,
	ScatterPlot,
} from "@mui/x-charts";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";

export default function HomePage() {
	const user = useUserData();

	const [avlQuizzes, setAvlQuizzes] = useState<Record<string, ItemInfo>>({});
	const [compQuizzes, setCompQuizzes] = useState<Record<string, ItemInfo>>({});
	const [avlModules, setAvlModules] = useState<Record<string, ItemInfo>>({});
	const [compModules, setCompModules] = useState<Record<string, ItemInfo>>({});
	const [activeTab, setActiveTab] = useState<"tab1" | "tab2">(() => {
		const savedTab = localStorage.getItem("activeHomeTab");
		return savedTab === "tab1" || savedTab === "tab2" ? savedTab : "tab1";
	});

	useEffect(() => {
		localStorage.setItem("activeHomeTab", activeTab);
	}, [activeTab]);
	const [userList, setUserList] = useState<AdminUserInfo[]>([]);
	const [quizCount, setQuizCount] = useState(0);
	const [moduleCount, setModuleCount] = useState(0);
	const [quizScores, setQuizScores] = useState<
		Record<string, QuizResult | null>
	>({});
	const [averageScoreList, setAverageScoreList] = useState<
		Array<{
			dayName: string;
			score: number | null;
		}>
	>([]);

	const [userScoreList, setUserScoreList] = useState<
		Array<{
			date: Date;
			score: number;
			userName: string;
			quizName: string;
		}>
	>([]);

	const [phishingSent, setPhishingSent] = useState(0);
	const [phishingClicked, setPhishingClicked] = useState(0);

	const userScoresDates = userScoreList.map((point) => point.date);
	const userScoresMin = new Date(
		Math.min(...userScoresDates.map((d) => d.getTime()))
	);
	const userScoresMax = new Date(
		Math.max(...userScoresDates.map((d) => d.getTime()))
	);
	const timeMargin = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

	async function fetchQuizScores(quizzes: Record<string, ItemInfo>) {
		const quizIds = Object.keys(quizzes);
		const scorePromises = quizIds.map(async (quizId) => {
			try {
				const res = await fetch(`/api/quiz/${quizId}/score`);
				const data = await res.json();
				return { id: quizId, score: data.success ? data.score : null };
			} catch (error) {
				console.error(`Error fetching score for quiz ${quizId}:`, error);
				return { id: quizId, score: null };
			}
		});

		const scores = await Promise.all(scorePromises);
		return scores.reduce((acc, { id, score }) => {
			acc[id] = score;
			return acc;
		}, {} as Record<string, QuizResult | null>);
	}

	async function fetchData() {
		try {
			const [quizResponse, moduleResponse] = await Promise.all([
				fetch("/api/quiz"),
				fetch("/api/modules"),
			]);

			const quizData = await quizResponse.json();
			const moduleData = await moduleResponse.json();

			if (quizData.success) {
				setAvlQuizzes(quizData.avlQuizzes as Record<string, ItemInfo>);
				setCompQuizzes(quizData.compQuizzes as Record<string, ItemInfo>);

				// Fetch scores for quizzes
				const availableScores = await fetchQuizScores(quizData.avlQuizzes);
				const completedScores = await fetchQuizScores(quizData.compQuizzes);
				setQuizScores({ ...availableScores, ...completedScores });
			} else {
				console.error("Failed to fetch quizzes:", quizData.message);
			}

			if (moduleData.success) {
				setAvlModules(moduleData.avlModules as Record<string, ItemInfo>);
				setCompModules(moduleData.compModules as Record<string, ItemInfo>);
			} else {
				console.error("Failed to fetch modules:", moduleData.message);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}

	async function fetchAdminUserList() {
		// Load cached data
		const cachedUsers = localStorage.getItem("adminUserListCache");
		const cachedQuizCount = localStorage.getItem("quizCountCache");
		const cachedModuleCount = localStorage.getItem("moduleCountCache");

		if (cachedUsers) {
			try {
				const parsed = JSON.parse(cachedUsers);
				if (Array.isArray(parsed)) {
					setUserList(parsed);
					setPhishingSent(
						parsed.reduce((acc: number, user: AdminUserInfo) => {
							return acc + (user?.phishingSent ?? 0);
						}, 0)
					);
					setPhishingClicked(
						parsed.reduce((acc: number, user: AdminUserInfo) => {
							return acc + (user?.phishingClicked ?? 0);
						}, 0)
					);
					console.log("Phishing:", phishingSent, phishingClicked);
				}
			} catch (err) {
				console.warn("Failed to parse adminUserListCache:", err);
			}
		}

		if (cachedQuizCount) {
			setQuizCount(parseInt(cachedQuizCount, 10));
		}

		if (cachedModuleCount) {
			setModuleCount(parseInt(cachedModuleCount, 10));
		}

		// Fetch updated data
		try {
			const [quizCountRes, moduleCountRes, companyUserListRes] =
				await Promise.all([
					fetch("/api/quizCount"),
					fetch("/api/moduleCount"),
					fetch("/api/companyUsers"),
				]);

			const quizCountData = await quizCountRes.json();
			if (quizCountData.success) {
				setQuizCount(quizCountData.count);
				localStorage.setItem("quizCountCache", quizCountData.count.toString());
			}

			const moduleCountData = await moduleCountRes.json();
			if (moduleCountData.success) {
				setModuleCount(moduleCountData.count);
				localStorage.setItem(
					"moduleCountCache",
					moduleCountData.count.toString()
				);
			}

			const companyUserListData = await companyUserListRes.json();
			if (
				companyUserListData.success &&
				Array.isArray(companyUserListData.users)
			) {
				const parsedUsers = companyUserListData.users;
				setUserList(parsedUsers);
				setPhishingSent(
					parsedUsers.reduce((acc: number, user: AdminUserInfo) => {
						return acc + (user?.phishingSent ?? 0);
					}, 0)
				);
				setPhishingClicked(
					parsedUsers.reduce((acc: number, user: AdminUserInfo) => {
						return acc + (user?.phishingClicked ?? 0);
					}, 0)
				);
				console.log("Phishing:", phishingSent, phishingClicked);
				localStorage.setItem("adminUserListCache", JSON.stringify(parsedUsers));
			} else {
				console.error("Failed to fetch users:", companyUserListData.message);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	}

	async function fetchStatistics() {
		try {
			const [averageScoresRes, userScoresRes] = await Promise.all([
				fetch(`/api/averageScores/${Date.now().toString()}`),
				fetch(`/api/userScores/${Date.now().toString()}`),
			]);

			const averageScoresData = await averageScoresRes.json();
			if (averageScoresData.success) {
				setAverageScoreList(averageScoresData.averageScores);
			}
			const userScoresData = await userScoresRes.json();
			if (userScoresData.success) {
				const parsedUserScores = userScoresData.userScores.map(
					(score: {
						date: string;
						score: number;
						userName: string;
						quizName: string;
					}) => ({
						...score,
						date: new Date(score.date),
					})
				);
				setUserScoreList(parsedUserScores);
			}
		} catch (error) {
			console.error("Error fetching statistics:", error);
		}
	}

	useEffect(() => {
		if (user?.role === "user") {
			fetchData();
		} else if (user?.role === "admin") {
			fetchAdminUserList();
			fetchStatistics();
		}
	}, [user]);

	const mapItems = (
		items: Record<string, ItemInfo>,
		itemType: "quiz" | "module"
	) =>
		(Object.entries(items) as [string, ItemInfo][]).map(([id, item]) => ({
			...item,
			id,
			itemType,
			score: itemType === "quiz" ? quizScores[id] ?? null : null, // Add score if it's a quiz
		}));

	const availableItems = [
		...mapItems(avlQuizzes, "quiz"),
		...mapItems(avlModules, "module"),
	];
	const completedItems = [
		...mapItems(compQuizzes, "quiz"),
		...mapItems(compModules, "module"),
	];

	return (
		<>
			<TitleBar user={user} />
			<PageContainer>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						p: 2,
					}}
				>
					{user?.role === "user" ? (
						<>
							<Paper
								sx={{
									mb: 3,
									borderRadius: "6px",
									p: "4px",
									background: "rgb(39, 39, 42)",
									display: "flex",
									justifyContent: "center",
									width: "fit-content",
									mx: "auto",
								}}
							>
								<Button
									sx={{
										borderRadius: "4px",
										px: 4,
										color:
											activeTab === "tab1"
												? "rgb(250, 250, 250)"
												: "rgb(161, 161, 170)",
										backgroundColor:
											activeTab === "tab1"
												? "rgb(9, 9, 11)"
												: "rgb(39, 39, 42)",
									}}
									onClick={() => setActiveTab("tab1")}
								>
									AVAILABLE
								</Button>
								<Button
									sx={{
										borderRadius: "4px",
										px: 4,
										color:
											activeTab === "tab2"
												? "rgb(250, 250, 250)"
												: "rgb(161, 161, 170)",
										backgroundColor:
											activeTab === "tab2"
												? "rgb(9, 9, 11)"
												: "rgb(39, 39, 42)",
									}}
									onClick={() => setActiveTab("tab2")}
								>
									COMPLETED
								</Button>
							</Paper>

							{activeTab === "tab1" ? (
								availableItems.length > 0 ? (
									<CardContainer items={availableItems} />
								) : (
									<Typography
										variant="h5"
										color="textSecondary"
										sx={{ fontStyle: "italic", textShadow: "0 0 6px #000" }}
									>
										No available items yet.
									</Typography>
								)
							) : completedItems.length > 0 ? (
								<CardContainer items={completedItems} />
							) : (
								<Typography
									variant="h5"
									color="textSecondary"
									sx={{ fontStyle: "italic", textShadow: "0 0 6px #000" }}
								>
									No completed items yet.
								</Typography>
							)}
						</>
					) : (
						<>
							<Box
								sx={{
									position: "relative",
									width: "100%",
									display: "flex",
									justifyContent: "center",
									mb: 3,
								}}
							>
								<Paper
									sx={{
										mb: 3,
										borderRadius: "6px",
										p: "4px",
										background: "rgb(39, 39, 42)",
										display: "flex",
										justifyContent: "center",
										width: "fit-content",
										position: "relative",
									}}
								>
									<Button
										sx={{
											borderRadius: "4px",
											px: 4,
											color:
												activeTab === "tab1"
													? "rgb(250, 250, 250)"
													: "rgb(161, 161, 170)",
											backgroundColor:
												activeTab === "tab1"
													? "rgb(9, 9, 11)"
													: "rgb(39, 39, 42)",
										}}
										onClick={() => setActiveTab("tab1")}
									>
										USERS ({userList.length})
									</Button>
									<Button
										sx={{
											borderRadius: "4px",
											px: 4,
											color:
												activeTab === "tab2"
													? "rgb(250, 250, 250)"
													: "rgb(161, 161, 170)",
											backgroundColor:
												activeTab === "tab2"
													? "rgb(9, 9, 11)"
													: "rgb(39, 39, 42)",
										}}
										onClick={() => setActiveTab("tab2")}
									>
										STATISTICS
									</Button>
									<IconButton
										sx={{
											position: "absolute",
											right: "-52px",
											color: "rgb(250, 250, 250)",
											borderColor: "rgb(39, 39, 42)",
											"&:hover": {
												bgcolor: "rgb(39, 39, 42)",
											},
											borderWidth: "1px",
											borderStyle: "solid",
											width: "36px",
											height: "36px",
										}}
										onClick={() => {
											if (user?.role === "admin") {
												fetchAdminUserList();
												fetchStatistics();
											}
										}}
									>
										<RefreshIcon fontSize="small" />
									</IconButton>
								</Paper>
							</Box>
							{activeTab === "tab1" ? (
								userList.length > 0 ? (
									<UserCardContainer
										users={userList}
										quizCount={quizCount}
										moduleCount={moduleCount}
									/>
								) : (
									<Typography variant="body1" color="textSecondary">
										No users found.
									</Typography>
								)
							) : (
								<Box
									component="section"
									sx={{
										display: "grid",
										gap: 3,
										gridTemplateColumns: {
											xs: "1fr",
											lg: "repeat(2, 1fr)",
											xl: "repeat(3, 1fr)",
										},
									}}
								>
									<Card>
										<Typography variant="h5" sx={{ mt: 2 }}>
											Average Scores
										</Typography>
										<Box sx={{ width: 600 }} />
										<Box sx={{ height: 300 }}>
											<ResponsiveChartContainer
												dataset={averageScoreList}
												xAxis={[{ dataKey: "dayName", scaleType: "band" }]}
												yAxis={[{ max: 100, min: 0 }]}
												series={[
													{
														type: "line",
														dataKey: "score",
														connectNulls: true,
														color: "rgb(250,250,250)",
														valueFormatter: (v) =>
															v != null ? `${v}%` : "N/A",
														area: true,
													},
												]}
												sx={{
													[`& .${axisClasses.root}`]: {
														[`.${axisClasses.tick}, .${axisClasses.line}`]: {
															stroke: "secondaryMain",
															strokeWidth: 2,
														},
														[`.${axisClasses.tickLabel}`]: {
															fill: "secondaryMain",
														},
													},
													[`& .${areaElementClasses.root}`]: {
														fill: "rgba(39, 39, 42, 0.25)",
													},
													[`& .${markElementClasses.root}`]: {
														scale: "0.5",
														fill: "rgb(250, 250, 250)",
													},
												}}
											>
												<AreaPlot />
												<LinePlot />
												<MarkPlot />
												<ChartsTooltip />
												<ChartsAxis />
											</ResponsiveChartContainer>
										</Box>
									</Card>
									<Card>
										<Typography variant="h5" sx={{ mt: 2 }}>
											Quiz Results
										</Typography>
										<Box sx={{ width: 600 }} />
										<Box sx={{ height: 300 }}>
											<ResponsiveChartContainer
												dataset={userScoreList}
												xAxis={[
													{
														dataKey: "date",
														scaleType: "time",
														min: new Date(userScoresMin.getTime() - timeMargin),
														max: new Date(userScoresMax.getTime() + timeMargin),
													},
												]}
												yAxis={[{ max: 100, min: 0 }]}
												series={[
													{
														type: "scatter",
														datasetKeys: {
															id: "quizName",
															x: "date",
															y: "score",
															z: "userName",
														},
														color: "rgb(250,250,250)",
														markerSize: 3,
														valueFormatter: ({ id, y, z }) =>
															`[${z}] ${id}: ${y}%`,
													},
												]}
												sx={{
													[`.${axisClasses.root}`]: {
														[`.${axisClasses.tick}, .${axisClasses.line}`]: {
															stroke: "secondaryMain",
															strokeWidth: 2,
														},
														[`.${axisClasses.tickLabel}`]: {
															fill: "secondaryMain",
														},
													},
												}}
											>
												<ScatterPlot />
												<ChartsTooltip trigger="item" />
												<ChartsAxis />
												<ChartsVoronoiHandler voronoiMaxRadius={60} />
											</ResponsiveChartContainer>
										</Box>
									</Card>
									<Card>
										<Typography variant="h5" sx={{ mt: 2 }}>
											Phishing Click-Rate
										</Typography>
										<Box sx={{ width: 600 }} />
										<Box
											sx={{
												height: 200,
												mt: 3,
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<Gauge
												value={phishingClicked}
												valueMax={phishingSent}
												startAngle={-110}
												endAngle={110}
												cornerRadius="50%"
												innerRadius="95%"
												outerRadius="100%"
												sx={{
													[`& .${gaugeClasses.valueText}`]: {
														fontSize: 40,
														transform: "translate(0px, -20px)",
													},
												}}
												text={({ value, valueMax }) =>
													value != null ? `${(value / valueMax) * 100}%` : "N/A"
												}
											/>
										</Box>
									</Card>
								</Box>
							)}
						</>
					)}
				</Box>
			</PageContainer>
		</>
	);
}
