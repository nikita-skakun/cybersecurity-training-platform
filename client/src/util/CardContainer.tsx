import { ItemInfo } from "@shared/types/item.ts";
import ItemCard from "./ItemCard.tsx";

interface CardsContainerProps {
	items: (ItemInfo & { id: string; itemType: "quiz" | "module" })[];
}

export default function CardsContainer({ items }: CardsContainerProps) {
	return (
		<div className="cards-container">
			{items.map((item) => (
				<ItemCard key={`${item.itemType}-${item.id}`} {...item} />
			))}
		</div>
	);
}
