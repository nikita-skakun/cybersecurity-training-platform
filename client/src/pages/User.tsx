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

export default function UserPage() {
	const navigate = useNavigate();
	const user = useUserData();

	return (
		<>
			<TitleBar user={user} />
			<PageContainer sx={{ alignItems: "center" }}>
				<Paper
					elevation={6}
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
