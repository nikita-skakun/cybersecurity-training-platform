import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
		<Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h3" component="h1" gutterBottom>
					You Failed the Phishing Test
				</Typography>
			</Box>
			<Box sx={{ mb: 4 }}>
				<Typography variant="body1" color="error">
					You have been caught in our phishing simulation! This exercise is
					designed to help you recognize phishing attempts and improve your
					cybersecurity awareness. Remember to always verify links and sender
					information before clicking or providing sensitive information.
				</Typography>
			</Box>
			<Button
				variant="contained"
				color="primary"
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/")}
			>
				Landing Page
			</Button>
		</Container>
	);
}
