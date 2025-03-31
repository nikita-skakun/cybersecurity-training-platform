import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import {
	Box,
	Typography,
	Button,
	CircularProgress,
	Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageContainer from "../util/PageContainer.tsx";
import { useEffect, useState } from "react";

export default function UserPage() {
	const navigate = useNavigate();
	const user = useUserData();

	const [backgroundId, setBackgroundId] = useState<number | null>();

	function setBackground(id: number) {
		localStorage.setItem("preferredBackground", id.toString());
		setBackgroundId(id);

		fetch("/api/users/background", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ backgroundId: id }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to set background");
				}
				return response.json();
			})
			.then(() => {
				globalThis.location.reload();
			})
			.catch((error) => console.error("Error setting background:", error));
	}

	useEffect(() => {
		const savedBackground = localStorage.getItem("preferredBackground");
		if (savedBackground) {
			setBackgroundId(parseInt(savedBackground, 10));
		}
	}, []);

	return (
		<>
			<TitleBar user={user} />
			<PageContainer sx={{ alignItems: "center" }} user={user}>
				<Paper
					elevation={4}
					sx={{
						display: "flex",
						flexDirection: "column",
						mt: 8,
						p: 4,
						minWidth: "400px",
						maxWidth: "90%",
						backdropFilter: "blur(40px)",
						borderRadius: 4,
					}}
				>
					<Typography variant="h4" gutterBottom>
						{`${user?.name ?? ""}`}
					</Typography>

					{!user ? (
						<CircularProgress sx={{ mt: 2 }} />
					) : (
						<Box sx={{ width: "100%" }}>
							<Typography variant="body1">
								<strong>Username:</strong> {user.username}
							</Typography>
							<Typography variant="body1">
								<strong>Company:</strong> {user.companyName}
							</Typography>
							<Typography variant="body1">
								<strong>Domain:</strong> {user.domain}
							</Typography>
							<Typography variant="body1">
								<strong>Role:</strong> {user.role}
							</Typography>
						</Box>
					)}

					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							gap: 2,
							mt: 3,
							mb: 3,
						}}
					>
						{[0, 1, 2, 3].map((id) => (
							<Button
								key={id}
								sx={{
									width: 50,
									height: 50,
									borderRadius: "50%",
									minWidth: "unset",
									padding: 0,
									...(id === 0
										? { backgroundColor: "background.paper" }
										: {
												backgroundImage: `url(/backgrounds/${id}.jpg)`,
												backgroundPosition: "center",
												backgroundSize: "cover",
										  }),
									border: id === backgroundId ? "2px solid" : "1px solid",
									borderColor: id === backgroundId ? "primary.main" : "divider",
								}}
								onClick={() => {
									setBackground(id);
								}}
							/>
						))}
					</Box>

					<Button
						variant="outlined"
						fullWidth
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate("/")}
						sx={{ mt: 3 }}
					>
						Home
					</Button>
				</Paper>
			</PageContainer>
		</>
	);
}
