import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import PageContainer from "../util/PageContainer.tsx";

export default function LandingPage() {
	const navigate = useNavigate();

	return (
		<PageContainer sx={{ alignItems: "center" }} user={null}>
			<Paper
				elevation={4}
				sx={{
					p: 4,
					maxWidth: 800,
					backdropFilter: "blur(40px)",
					borderRadius: 4,
					textAlign: "center",
				}}
			>
				<Box sx={{ mb: 3 }}>
					<Typography variant="h3" component="h1" gutterBottom>
						Welcome to EchoShield
					</Typography>
				</Box>
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" sx={{ mb: 2 }}>
						EchoShield is a comprehensive cybersecurity training platform
						designed to help companies bolster their defenses against cyber
						threats. Our platform provides:
					</Typography>
					<Box component="ul" sx={{ textAlign: "left", mb: 2 }}>
						<li>
							<Typography variant="body1">
								Interactive quizzes to assess your cybersecurity knowledge
							</Typography>
						</li>
						<li>
							<Typography variant="body1">
								Educational videos that simplify complex security topics
							</Typography>
						</li>
						<li>
							<Typography variant="body1">
								Realistic phishing simulations to test and improve employee
								vigilance
							</Typography>
						</li>
					</Box>
					<Typography variant="h6">
						For secure access, our system integrates seamlessly with your
						company's Active Directory using LDAP for authentication. A robust
						JWT token-based system ensures that only authorized users gain
						access to the training modules.
					</Typography>
				</Box>
				<Button variant="outlined" onClick={() => navigate("/login")}>
					Login
				</Button>
			</Paper>
		</PageContainer>
	);
}
