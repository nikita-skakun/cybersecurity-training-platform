import { useNavigate } from "react-router-dom";
import {
	CardContent,
	Typography,
	Chip,
	Box,
	Card,
	Button,
	Tooltip,
} from "@mui/material";
import { ItemInfo } from "@shared/types/item.ts";
import { QuizResult } from "@shared/types/quiz.ts";
import theme from "./Theme.ts";
import DownloadIcon from "@mui/icons-material/Download";

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
				overflow: "hidden",
				"&:hover": {
					background: "rgb(39, 39, 42)",
					transition: "background 0.2s",
				},
				display: "flex",
				flexDirection: "column",
				height: 210,
				width: "auto",
			}}
		>
			<Box sx={{ width: 450 }} />
			<Box
				sx={{
					px: 2,
					pt: 2,
					pb: 0.5,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1,
				}}
			>
				<Box sx={{ flex: 1, display: "flex", justifyContent: "left" }}>
					<Chip
						label={itemType === "quiz" ? "Quiz" : "Module"}
						size="small"
						variant="outlined"
						sx={{
							color: barTextColor,
							fontWeight: 700,
							textAlign: "center",
						}}
					/>
				</Box>

				{score != null && itemType === "quiz" && (
					<Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
						<Chip
							label={`Score: ${score.score}%`}
							size="small"
							variant="outlined"
							sx={{
								color: "success.main",
								fontWeight: 700,
								textAlign: "center",
							}}
						/>
					</Box>
				)}

				<Box sx={{ flex: 1, display: "flex", justifyContent: "right" }}>
					<Chip
						label={`${itemCount} ${
							itemType === "quiz" ? "questions" : "pages"
						}`}
						size="small"
						variant="outlined"
						sx={{
							color: barTextColor,
							fontWeight: 700,
							textAlign: "center",
						}}
					/>
				</Box>
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
						maxHeight: "66px",
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

			{itemType === "quiz" && score !== null && (
				<Box
					sx={{
						mt: "auto",
						display: "flex",
						justifyContent: "flex-end",
						pr: "8px",
						pb: "8px",
					}}
				>
					<Tooltip title="Download Certificate" arrow disableInteractive>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/certificate/${id}`);
							}}
							onMouseOver={(e) => e.stopPropagation()}
							onMouseEnter={(e) => e.stopPropagation()}
							variant="contained"
							sx={{
								backgroundColor: "rgb(250, 250, 250)",
								color: "rgb(9, 9, 11)",
								borderRadius: "50%",
								minWidth: "32px",
								width: "32px",
								height: "32px",
								position: "relative",
								zIndex: 2,
								"&:hover": {
									backgroundColor: "rgb(230, 230, 230)",
								},
							}}
						>
							<DownloadIcon fontSize="small" />
						</Button>
					</Tooltip>
				</Box>
			)}
		</Card>
	);
}
