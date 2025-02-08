import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/api_utils.ts";
import { TitleBar } from "../util/screen_utils.tsx";
import { ItemInfo } from "@shared/types/item.ts";
import "./Home.css";

export default function HomePage() {
	const user = useUserData();
	const navigate = useNavigate();

	const [avlQuizzes, setAvlQuizzes] = useState<Record<string, ItemInfo>>({});
	const [compQuizzes, setCompQuizzes] = useState<Record<string, ItemInfo>>({});
	const [avlModules, setAvlModules] = useState<Record<string, ItemInfo>>({});
	const [compModules, setCompModules] = useState<Record<string, ItemInfo>>({});

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

				{availableItems.length > 0 && (
					<>
						<h2>Unlocked Items</h2>
						<div className="cards-container">
							{availableItems.map((item) => (
								<div
									className="item-card"
									key={`${item.itemType}-${item.id}`}
									onClick={() =>
										navigate(
											item.itemType === "quiz"
												? `/quiz/${item.id}`
												: `/module/${item.id}`
										)
									}
								>
									<h2>{item.title}</h2>
									<p>{item.description}</p>
									<p>
										{item.itemType === "quiz"
											? `Questions: ${item.itemCount}`
											: `Pages: ${item.itemCount}`}
									</p>
								</div>
							))}
						</div>
					</>
				)}

				{completedItems.length > 0 && (
					<>
						<h2>Completed Items</h2>
						<div className="cards-container">
							{completedItems.map((item) => (
								<div
									className="item-card"
									key={`${item.itemType}-${item.id}`}
									onClick={() =>
										navigate(
											item.itemType === "quiz"
												? `/quiz/${item.id}`
												: `/module/${item.id}`
										)
									}
								>
									<h2>{item.title}</h2>
									<p>{item.description}</p>
									<p>
										{item.itemType === "quiz"
											? `Questions: ${item.itemCount}`
											: `Pages: ${item.itemCount}`}
									</p>
								</div>
							))}
						</div>
					</>
				)}
			</main>
		</div>
	);
}
