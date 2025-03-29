import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import { ItemInfo } from "@shared/types/item.ts";
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
		<Card
			onClick={handleClick}
			sx={{
				cursor: "pointer",
				boxShadow: 3,
				borderRadius: 2,
				overflow: "hidden",
				transition: "transform 0.2s ease-in-out",
				"&:hover": { transform: "scale(1.02)" },
				display: "flex",
				flexDirection: "column",
				height: 200,
			}}
		>
			<Box
				sx={(theme) => ({
					backgroundColor:
						itemType === "quiz"
							? theme.palette.info.light
							: theme.palette.warning.light,
					px: 2,
					py: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				})}
			>
				<Chip
					label={itemType === "quiz" ? "Quiz" : "Module"}
					size="small"
					sx={(theme) => ({
						backgroundColor: "#fff",
						color:
							itemType === "quiz"
								? theme.palette.info.main
								: theme.palette.warning.main,
						fontWeight: 700,
						boxShadow: 1,
					})}
				/>

				{score != null && itemType === "quiz" && (
					<Chip
						label={`${score.score}%`}
						size="small"
						sx={(theme) => ({
							backgroundColor: "#fff",
							color: theme.palette.success.main,
							fontWeight: 700,
							boxShadow: 1,
							mx: "auto",
						})}
					/>
				)}

				<Chip
					label={`${itemCount} min`}
					size="small"
					sx={(theme) => ({
						backgroundColor: "#fff",
						color:
							itemType === "quiz"
								? theme.palette.info.main
								: theme.palette.warning.main,
						fontWeight: 700,
						boxShadow: 1,
					})}
				/>
			</Box>

			<CardContent
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<Typography variant="h6" gutterBottom>
					{title}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{description}
				</Typography>
			</CardContent>
		</Card>
	);
}
