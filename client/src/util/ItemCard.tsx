import { useNavigate } from "react-router-dom";
import { ItemInfo } from "@shared/types/item.ts";
import "./ItemCard.css";
import { QuizResult } from "@shared/types/quiz.ts";

export interface ItemCardProps extends ItemInfo {
	id: string;
	itemType: "quiz" | "module";
	score: QuizResult | null;
}

export default function ItemCard({
	id,
	itemType,
	title,
	description,
	itemCount,
	score,
}: ItemCardProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(itemType === "quiz" ? `/quiz/${id}` : `/module/${id}`);
	};

	return (
		<div className="item-card" onClick={handleClick}>
			<div className={`item-type-badge ${itemType}`}>
				{itemType === "quiz" ? "Quiz" : "Module"}
			</div>
			<div className="time-badge">{itemCount} min</div>
			<h2>{title}</h2>
			<p>{description}</p>
			{score != null && itemType === "quiz" && (
				<div className="score-badge">{score.score}%</div>
			)}
		</div>
	);
}
