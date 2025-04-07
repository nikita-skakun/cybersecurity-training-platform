import { Box, Typography, Button, Card } from "@mui/material";
import PageContainer from "../util/PageContainer.tsx";
import { TitleBar } from "../util/TitleBar.tsx";
import { useUserData } from "../util/ApiUtils.ts";

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
					<Button
						variant="outlined"
						href="mailto:admin@echo-shield.com?subject=EchoShield Inquiry"
					>
						Get In Touch
					</Button>

				</Card>
			</PageContainer>
		</>
	);
}
