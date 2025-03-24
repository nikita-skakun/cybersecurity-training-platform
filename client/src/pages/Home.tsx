import { useEffect, useState } from "react";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { ItemInfo } from "@shared/types/item.ts";
import { AdminUserInfo } from "@shared/types/user.ts";
import { QuizResult } from "@shared/types/quiz.ts";
import CardContainer from "../util/CardContainer.tsx";
import UserCardContainer from "../util/UserCardContainer.tsx";
import "./Home.css";

export default function HomePage() {
	const user = useUserData();

	const [avlQuizzes, setAvlQuizzes] = useState<Record<string, ItemInfo>>({});
	const [compQuizzes, setCompQuizzes] = useState<Record<string, ItemInfo>>({});
	const [avlModules, setAvlModules] = useState<Record<string, ItemInfo>>({});
	const [compModules, setCompModules] = useState<Record<string, ItemInfo>>({});
	const [activeTab, setActiveTab] = useState<"available" | "completed">(
		"available"
	);
	const [userList, setUserList] = useState<AdminUserInfo[]>([]);
	const [quizCount, setQuizCount] = useState(0);
	const [moduleCount, setModuleCount] = useState(0);
	const [quizScores, setQuizScores] = useState<
		Record<string, QuizResult | null>
	>({});

	useEffect(() => {
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
					localStorage.setItem(
						"quizCountCache",
						quizCountData.count.toString()
					);
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
					setUserList(companyUserListData.users);
					localStorage.setItem(
						"adminUserListCache",
						JSON.stringify(companyUserListData.users)
					);
				} else {
					console.error("Failed to fetch users:", companyUserListData.message);
				}
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		}

		if (user?.role === "user") {
			fetchData();
		} else if (user?.role === "admin") {
			fetchAdminUserList();
		}
	}, [user?.role]);

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
		<div className="page-container">
			<TitleBar user={user} />
			<main className="fullsize-container">
				<h1>Welcome Home!</h1>

				{user?.role === "user" ? (
					<>
						<div className="tab-buttons">
							<button
								type="button"
								className={activeTab === "available" ? "active" : ""}
								onClick={() => setActiveTab("available")}
							>
								Available
							</button>
							<button
								type="button"
								className={activeTab === "completed" ? "active" : ""}
								onClick={() => setActiveTab("completed")}
							>
								Completed
							</button>
						</div>

						{activeTab === "available" ? (
							availableItems.length > 0 ? (
								<CardContainer items={availableItems} />
							) : (
								<p className="empty-message">No available items yet.</p>
							)
						) : completedItems.length > 0 ? (
							<CardContainer items={completedItems} />
						) : (
							<p className="empty-message">No completed items yet.</p>
						)}
					</>
				) : (
					// Render admin view as long thin user cards
					<div className="admin-user-section">
						<h2>All Users - {user?.companyName ?? "Company"}</h2>
						{userList.length > 0 ? (
							<UserCardContainer
								users={userList}
								quizCount={quizCount}
								moduleCount={moduleCount}
							/>
						) : (
							<p className="empty-message">No users found.</p>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
