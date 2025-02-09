import { useNavigate } from "react-router-dom";
import { ItemInfo } from "@shared/types/item.ts";

export interface ItemCardProps extends ItemInfo {
	id: string;
	itemType: "quiz" | "module";
}

export default function ItemCard({
	id,
	itemType,
	title,
	description,
	itemCount,
}: ItemCardProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(itemType === "quiz" ? `/quiz/${id}` : `/module/${id}`);
	};

	return (
		<div className="item-card" onClick={handleClick}>
			<h2>{title}</h2>
			<p>{description}</p>
			<p>
				{itemType === "quiz"
					? `Questions: ${itemCount}`
					: `Pages: ${itemCount}`}
			</p>
		</div>
	);
}
