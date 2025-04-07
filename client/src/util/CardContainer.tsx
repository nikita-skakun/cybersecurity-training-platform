import { ItemInfo } from "@shared/types/item.ts";
import ItemCard from "./ItemCard.tsx";
import { QuizResult } from "@shared/types/quiz.ts";
import Box from "@mui/material/Box";

interface CardContainerProps {
	items: (ItemInfo & {
		id: string;
		itemType: "quiz" | "module";
		score: QuizResult | null;
	})[];
}

export default function CardContainer({ items }: CardContainerProps) {
	return (
		<Box
			component="section"
			sx={{
				display: "grid",
				gap: 3,
				gridTemplateColumns: {
					xs: "1fr",
					md: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				},
			}}
		>
			{items.map((item) => (
				<ItemCard {...item} />
			))}
		</Box>
	);
}
