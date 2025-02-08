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
		async function fetchQuizzes() {
			try {
				const response = await fetch("/api/quiz");
				const data = await response.json();
				if (data.success) {
					setAvlQuizzes(data.avlQuizzes as Record<string, ItemInfo>);
					setCompQuizzes(data.compQuizzes as Record<string, ItemInfo>);
				} else {
					console.error("Failed to fetch quizzes:", data.message);
				}
			} catch (error) {
				console.error("Error fetching quizzes:", error);
			}
		}
		async function fetchModules() {
			try {
				const response = await fetch("/api/modules");
				const data = await response.json();
				if (data.success) {
					setAvlModules(data.avlModules as Record<string, ItemInfo>);
					setCompModules(data.compModules as Record<string, ItemInfo>);
				} else {
					console.error("Failed to fetch modules:", data.message);
				}
			} catch (error) {
				console.error("Error fetching modules:", error);
			}
		}
		fetchQuizzes();
		fetchModules();
	}, []);

	if (!avlQuizzes || !compQuizzes || !avlModules || !compModules)
		return <div>Loading...</div>;
	
	// Combine available items and completed items with an added type property.
	const availableItems = [
		...(Object.entries(avlQuizzes) as [string, ItemInfo][]).map(
			([id, item]) => ({ ...item, id, itemType: "quiz" })
		),
		...(Object.entries(avlModules) as [string, ItemInfo][]).map(
			([id, item]) => ({ ...item, id, itemType: "module" })
		),
	];

	const completedItems = [
		...(Object.entries(compQuizzes) as [string, ItemInfo][]).map(
			([id, item]) => ({ ...item, id, itemType: "quiz" })
		),
		...(Object.entries(compModules) as [string, ItemInfo][]).map(
			([id, item]) => ({ ...item, id, itemType: "module" })
		),
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
