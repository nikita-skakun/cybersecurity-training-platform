import { ItemInfo } from "@shared/types/item.ts";
import ItemCard from "./ItemCard.tsx";
import { QuizResult } from "@shared/types/quiz.ts";
import Grid from "@mui/material/Grid";

interface CardContainerProps {
	items: (ItemInfo & {
		id: string;
		itemType: "quiz" | "module";
		score: QuizResult | null;
	})[];
}

export default function CardContainer({ items }: CardContainerProps) {
	return (
		<Grid container spacing={2}>
			{items.map((item) => (
				<Grid
					size={{ sm: 12, md: 6, lg: 4, xl: 3 }}
					key={`${item.itemType}-${item.id}`}
				>
					<ItemCard {...item} />
				</Grid>
			))}
		</Grid>
	);
}
