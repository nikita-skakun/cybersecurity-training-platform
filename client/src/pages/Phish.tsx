import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageContainer from "../util/PageContainer.tsx";

export default function PhishPage() {
	const { uuid } = useParams<{ uuid: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (uuid) {
			fetch(`/api/phishCaught/${uuid}`, {
				method: "POST",
			}).catch((error) => {
				console.error("Error reporting phishing simulation:", error);
			});
		}
	}, [uuid]);

	return (
		<PageContainer sx={{ alignItems: "center" }}>
			<Paper
				elevation={4}
				sx={{
					p: 4,
					maxWidth: 800,
					backdropFilter: "blur(6px)",
					borderRadius: 4,
					textAlign: "center",
				}}
			>
				<Box sx={{ mb: 3 }}>
					<Typography variant="h3" component="h1" color="error" gutterBottom>
						You Failed the Phishing Test
					</Typography>
				</Box>
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6">
						You have been caught in our phishing simulation! This exercise is
						designed to help you recognize phishing attempts and improve your
						cybersecurity awareness. Remember to always verify links and sender
						information before clicking or providing sensitive information.
					</Typography>
				</Box>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate("/")}
				>
					Landing Page
				</Button>
			</Paper>
		</PageContainer>
	);
}
