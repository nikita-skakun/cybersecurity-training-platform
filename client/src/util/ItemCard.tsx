import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import { ItemInfo } from "@shared/types/item.ts";
import { QuizResult } from "@shared/types/quiz.ts";
import theme from "./Theme.ts";

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

	const barTextColor =
		itemType === "quiz"
			? theme.palette.info.light
			: theme.palette.warning.light;

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
				height: 180,
				backdropFilter: "blur(40px)",
			}}
		>
			<Box
				sx={{
					px: 2,
					pt: 2,
					pb: 0.5,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Chip
					label={itemType === "quiz" ? "Quiz" : "Module"}
					size="small"
					sx={{
						backgroundColor: "#2b2f31",
						color: barTextColor,
						fontWeight: 700,
						boxShadow: 1,
					}}
				/>

				{score != null && itemType === "quiz" && (
					<Box
						sx={{
							position: "absolute",
							left: 0,
							right: 0,
							display: "flex",
							justifyContent: "center",
						}}
					>
						<Chip
							label={`Score: ${score.score}%`}
							size="small"
							sx={(theme) => ({
								backgroundColor: "#2b2f31",
								color: theme.palette.success.light,
								fontWeight: 700,
								boxShadow: 1,
							})}
						/>
					</Box>
				)}

				<Chip
					label={`${itemCount} ${itemType === "quiz" ? "questions" : "pages"}`}
					size="small"
					sx={{
						backgroundColor: "#2b2f31",
						color: barTextColor,
						fontWeight: 700,
						boxShadow: 1,
					}}
				/>
			</Box>

			<CardContent
				sx={{
					pt: 0.25,
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Typography variant="h5" sx={{ color: "#eee" }} gutterBottom>
					{title}
				</Typography>
				<Box
					sx={{
						overflowY: "auto",
						maxHeight: "80px",
						"&::-webkit-scrollbar": {
							width: "4px",
							backgroundColor: "transparent",
						},
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: "transparent",
							borderRadius: "4px",
							transition: "background-color 0.2s",
						},
						"&:hover::-webkit-scrollbar-thumb": {
							backgroundColor: "rgba(255,255,255,0.2)",
						},
					}}
				>
					<Typography variant="body2" color="text.secondary">
						{description}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}
