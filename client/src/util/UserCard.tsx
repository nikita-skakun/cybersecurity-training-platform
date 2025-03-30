import { AdminUserInfo } from "@shared/types/user.ts";
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	CardActions,
	Tooltip,
} from "@mui/material";

interface UserCardProps {
	user: AdminUserInfo;
	quizCount: number;
	moduleCount: number;
}

export default function UserCard({
	user,
	quizCount,
	moduleCount,
}: UserCardProps) {
	const handleSendPhishingEmail = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (user.id < 0) {
			alert("User never logged in");
			return;
		}

		fetch("/api/sendPhishingEmail", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: user.username,
				name: user.name,
				userId: user.id,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`Test email sent to ${user.username}`);
				} else {
					alert(`Failed to send email: ${data.message}`);
				}
			})
			.catch((err) => {
				console.error("Error sending test email:", err);
				alert("Error sending test email");
			});
	};

	const getColor = (value: number, thresholds: [number, number]): string => {
		if (value < thresholds[0]) return "#f44336"; // red
		if (value >= thresholds[1]) return "#4caf50"; // green
		return "#ff9800"; // yellow/orange
	};

	const avgScore = user.avgScore ?? 0;
	const avgScoreColor = getColor(avgScore, [50, 90]);

	const compQuizRatio = quizCount > 0 ? (user.compQuizzes ?? 0) / quizCount : 0;
	const compQuizColor = getColor(compQuizRatio, [0.5, 1]);

	const compModuleRatio =
		moduleCount > 0 ? (user.compModules ?? 0) / moduleCount : 0;
	const compModuleColor = getColor(compModuleRatio, [0.5, 1]);

	const phishingColor = (user.phishingClicked ?? 0) > 0 ? "#f44336" : "#4caf50";

	return (
		<Card
			elevation={4}
			sx={{
				width: 360,
				m: 1,
				boxShadow: 3,
				borderRadius: 2,
				transition: "transform 0.2s ease-in-out",
				"&:hover": { transform: "scale(1.02)" },
				backdropFilter: "blur(40px)",
			}}
		>
			<CardContent>
				<Typography variant="h6">{user.name}</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					@{user.username}
				</Typography>

				{user.id < 0 ? (
					<Box
						sx={{
							mt: 2,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: 135,
						}}
					>
						<Typography
							variant="h6"
							sx={{ color: "#f44336" }}
							align="center"
						>
							User never logged in
						</Typography>
					</Box>
				) : (
					<Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="body2">Average quiz score</Typography>
							<Typography
								variant="body2"
								sx={{
									backgroundColor: avgScoreColor,
									color: "#fff",
									px: 1,
									py: 0.5,
									borderRadius: 1,
									minWidth: 50,
									textAlign: "center",
								}}
							>
								{avgScore.toFixed(0)}%
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="body2">Completed quizzes</Typography>
							<Tooltip
								title="Completed quizzes / Total quizzes"
								arrow
								disableInteractive
							>
								<Typography
									variant="body2"
									sx={{
										backgroundColor: compQuizColor,
										color: "#fff",
										px: 1,
										py: 0.5,
										borderRadius: 1,
										minWidth: 50,
										textAlign: "center",
									}}
								>
									{user.compQuizzes} / {quizCount}
								</Typography>
							</Tooltip>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="body2">Completed modules</Typography>
							<Tooltip
								title="Completed modules / Total modules"
								arrow
								disableInteractive
							>
								<Typography
									variant="body2"
									sx={{
										backgroundColor: compModuleColor,
										color: "#fff",
										px: 1,
										py: 0.5,
										borderRadius: 1,
										minWidth: 50,
										textAlign: "center",
									}}
								>
									{user.compModules} / {moduleCount}
								</Typography>
							</Tooltip>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="body2">Phishing emails clicked</Typography>
							<Tooltip
								title="Clicked emails / Sent emails"
								arrow
								disableInteractive
							>
								<Typography
									variant="body2"
									sx={{
										backgroundColor: phishingColor,
										color: "#fff",
										px: 1,
										py: 0.5,
										borderRadius: 1,
										minWidth: 50,
										textAlign: "center",
									}}
								>
									{user.phishingClicked} / {user.phishingSent}
								</Typography>
							</Tooltip>
						</Box>
					</Box>
				)}
			</CardContent>
			<CardActions>
				<Button
					size="small"
					variant="outlined"
					onClick={handleSendPhishingEmail}
					disabled={user.id < 0}
					fullWidth
				>
					Phish
				</Button>
			</CardActions>
		</Card>
	);
}
