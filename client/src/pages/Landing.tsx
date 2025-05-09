import { Box, Typography, Button, Card } from "@mui/material";
import PageContainer from "../util/PageContainer.tsx";
import { TitleBar } from "../util/TitleBar.tsx";
import { useUserData } from "../util/ApiUtils.ts";
import GitHub from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";

export default function LandingPage() {
	const user = useUserData(false);

	return (
		<>
			<TitleBar user={user} />
			<PageContainer sx={{ alignItems: "center" }}>
				<Card
					sx={{
						p: 4,
						maxWidth: 800,
						borderRadius: 4,
						textAlign: "center",
					}}
				>
					<Box sx={{ mb: 3 }}>
						<Typography variant="h3" component="h1" gutterBottom>
							Welcome to Echo Shield
						</Typography>
					</Box>
					<Box sx={{ mb: 4 }}>
						<Typography variant="h6" sx={{ mb: 2 }}>
							Echo Shield is a comprehensive cybersecurity training platform
							designed to help companies train their employees and bolster their
							defenses against cyber threats. Our platform provides:
						</Typography>
						<Box
							component="ul"
							sx={{ mb: 2, listStyleType: "none", padding: 0 }}
						>
							<li>
								<Typography variant="h6">
									Interactive quizzes to assess your employees' cybersecurity
									knowledge
								</Typography>
							</li>
							<li>
								<Typography variant="h6">
									Educational videos that simplify complex security topics for
									employees
								</Typography>
							</li>
							<li>
								<Typography variant="h6">
									Realistic phishing simulations to test and improve employee
									vigilance
								</Typography>
							</li>
						</Box>
						<Typography variant="body1">
							For secure access, our system integrates seamlessly with your
							company's Active Directory using LDAP for authentication. A robust
							JWT token-based system ensures that only authorized users gain
							access to the training modules.
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
						<Button
							variant="outlined"
							href={`mailto:${
								import.meta.env.VITE_CONTACT_EMAIL || "admin@echo-shield.com"
							}?subject=EchoShield Inquiry`}
							startIcon={<EmailIcon />}
						>
							Get In Touch
						</Button>
						<Button
							variant="outlined"
							href="https://github.com/nikita-skakun/cybersecurity-training-platform"
							startIcon={<GitHub />}
						>
							GitHub
						</Button>
					</Box>
				</Card>
			</PageContainer>
		</>
	);
}
