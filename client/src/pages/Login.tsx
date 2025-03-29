import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
} from "@mui/material";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");

		const response = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const result = await response.json();

		if (result.success) {
			navigate("/");
		} else {
			setError(result.message);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundImage: "url('/background.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: 2,
			}}
		>
			<Paper
				elevation={6}
				sx={{
					p: 4,
					width: "100%",
					maxWidth: 400,
					bgcolor: "rgba(255, 255, 255, 0.7)",
					backdropFilter: "blur(12px)",
					borderRadius: 4,
				}}
			>
				<Typography variant="h4" align="center" gutterBottom>
					Cybersecurity Training Platform
				</Typography>
				<Typography variant="h5" align="center" gutterBottom>
					Login
				</Typography>
				<Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
					<TextField
						label="Email"
						type="email"
						fullWidth
						required
						margin="normal"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						label="Password"
						type="password"
						fullWidth
						required
						margin="normal"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					{error && (
						<Typography
							variant="body2"
							color="error"
							align="center"
							sx={{ mt: 1 }}
						>
							{error}
						</Typography>
					)}
					<Button
						type="submit"
						variant="contained"
						color="primary"
						fullWidth
						disabled={!email || !password}
						sx={{ mt: 3 }}
					>
						Login
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
