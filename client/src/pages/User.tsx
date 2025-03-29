import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import {
	Container,
	Box,
	Typography,
	Button,
	CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function UserPage() {
	const navigate = useNavigate();
	const user = useUserData();

	return (
		<>
			<TitleBar user={user} />
			<Container maxWidth="sm">
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						mt: 4,
						p: 3,
						boxShadow: 3,
						borderRadius: 2,
						bgcolor: "background.paper",
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
						variant="contained"
						color="primary"
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate("/")}
						sx={{ mt: 3, width: "100%" }}
					>
						Home
					</Button>
				</Box>
			</Container>
		</>
	);
}
