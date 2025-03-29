import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Tooltip,
	Box,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export const TitleBar: React.FC<{ user: User | null }> = ({ user }) => {
	const [countdown, setCountdown] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const exp = user?.exp;
		if (exp) {
			const interval = setInterval(() => {
				const currentTime = Math.floor(Date.now() / 1000);
				const remainingTime = exp - currentTime;

				if (remainingTime <= 0) {
					clearInterval(interval);
					navigate("/login");
				} else {
					const hours = Math.floor(remainingTime / 3600);
					const minutes = Math.floor(remainingTime / 60) % 60;
					const seconds = remainingTime % 60;
					setCountdown(`${hours}h ${minutes}m ${seconds}s`);
				}
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [user, navigate]);

	const handleLogout = async () => {
		try {
			await fetch("/api/logout", {
				method: "POST",
				credentials: "include",
			});
			navigate("/login");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<AppBar position="static" sx={{ mb: 2, bgcolor: "#212121" }}>
			<Toolbar>
				<Typography
					variant="h6"
					sx={{ flexGrow: 1, cursor: "pointer", color: "white" }}
					onClick={() => navigate("/")}
				>
					Cybersecurity Training Platform
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Tooltip title={`Session expires in: ${countdown ?? "???"}`} arrow>
						<Button
							variant="contained"
							startIcon={<AccountCircleIcon />}
							onClick={() => navigate("/user")}
							sx={{ color: "white" }}
						>
							{user?.name ?? "???"}
						</Button>
					</Tooltip>
					<Button color="error" variant="contained" onClick={handleLogout}>
						Logout
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
};
