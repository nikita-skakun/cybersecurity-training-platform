import { useEffect, useState } from "react";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { ItemInfo } from "@shared/types/item.ts";
import CardContainer from "../util/CardContainer.tsx";
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
		fetchData();
	}, []);

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
			</main>
		</div>
	);
}
