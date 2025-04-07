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
import LogoutIcon from "@mui/icons-material/Logout";

export const TitleBar: React.FC<{ user: User | null }> = ({ user }) => {
	const [countdown, setCountdown] = useState("");
	const navigate = useNavigate();

	function updateExpirationTime() {
		if (!user?.exp) return;

		const currentTime = Math.floor(Date.now() / 1000);
		const remainingTime = user?.exp - currentTime;

		if (remainingTime <= 0) {
			navigate("/login");
		} else {
			const hours = Math.floor(remainingTime / 3600);
			const minutes = Math.floor(remainingTime / 60) % 60;
			const seconds = remainingTime % 60;
			setCountdown(`${hours}h ${minutes}m ${seconds}s`);
		}
	}

	useEffect(() => {
		const exp = user?.exp;
		if (exp) {
			const interval = setInterval(() => {
				updateExpirationTime();
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [user, navigate]);

	const handleLogout = async () => {
		try {
			// Clear local storage
			localStorage.removeItem("userData");
			localStorage.removeItem("activeHomeTab");
			localStorage.removeItem("adminUserListCache");
			localStorage.removeItem("quizCountCache");
			localStorage.removeItem("moduleCountCache");

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
		<AppBar
			position="static"
			sx={{
				background: "rgba(0, 0, 0, 0)",
				boxShadow: "none",
			}}
		>
			<Toolbar>
				<Typography
					variant="h6"
					noWrap
					sx={{
						cursor: "pointer",
						fontWeight: 700,
						color: "primary.main",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
					onClick={() => navigate("/home")}
				>
					Echo Shield
				</Typography>
				<Box sx={{ flexGrow: 1 }} />
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{user ? (
						<>
							<Tooltip
								title={`Session expires in: ${countdown ?? "???"}`}
								arrow
								disableInteractive
								onOpen={updateExpirationTime}
							>
								<Button
									variant="outlined"
									startIcon={<AccountCircleIcon />}
									onClick={() => navigate("/user")}
								>
									<Typography noWrap sx={{ overflow: "hidden" }}>
										{user?.name ?? "???"}
									</Typography>
								</Button>
							</Tooltip>
							<Tooltip title="Logout" arrow disableInteractive>
								<Button variant="outlined" onClick={handleLogout}>
									<LogoutIcon />
								</Button>
							</Tooltip>
						</>
					) : (
						<Button variant="outlined" onClick={() => navigate("/login")}>
							<Typography noWrap sx={{ overflow: "hidden" }}>
								Login
							</Typography>
						</Button>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
};
