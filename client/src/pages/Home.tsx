import { useEffect, useState } from "react";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { ItemInfo } from "@shared/types/item.ts";
import { AdminUserInfo } from "@shared/types/user.ts";
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

	useEffect(() => {
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
			const cached = localStorage.getItem("adminUserListCache");
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					if (Array.isArray(parsed)) {
						setUserList(parsed);
					}
				} catch (err) {
					console.warn("Failed to parse adminUserListCache:", err);
				}
			}

			try {
				const [quizCount, moduleCount, companyUserList] = await Promise.all([
					fetch("/api/quizCount"),
					fetch("/api/moduleCount"),
					fetch("/api/companyUsers"),
				]);

				const companyUserListData = await companyUserList.json();
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

				const quizCountData = await quizCount.json();
				if (quizCountData.success) {
					setQuizCount(quizCountData.count);
				}

				const moduleCountData = await moduleCount.json();
				if (moduleCountData.success) {
					setModuleCount(moduleCountData.count);
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
							<UserCardContainer users={userList} quizCount={quizCount} moduleCount={moduleCount} />
						) : (
							<p className="empty-message">No users found.</p>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
