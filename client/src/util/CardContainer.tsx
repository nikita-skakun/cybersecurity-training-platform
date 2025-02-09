import { ItemInfo } from "@shared/types/item.ts";
import ItemCard from "./ItemCard.tsx";
import "./CardContainer.css";

interface CardContainerProps {
	items: (ItemInfo & { id: string; itemType: "quiz" | "module" })[];
}

export default function CardContainer({ items }: CardContainerProps) {
	return (
		<div className="card-container">
			{items.map((item) => (
				<ItemCard key={`${item.itemType}-${item.id}`} {...item} />
			))}
		</div>
	);
}
