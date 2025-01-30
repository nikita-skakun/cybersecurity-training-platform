import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
	const [name, setName] = useState(undefined);
	const [expTime, setExpTime] = useState(null);
	const [countdown, setCountdown] = useState("");
	const navigate = useNavigate();

	// Fetch user data on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/api/home", {
					method: "GET",
					credentials: "include",
				});

				const result = await response.json();

				if (result.success) {
					setName(result.user.name);
					setExpTime(result.user.exp);
				} else {
					navigate("/login");
					console.error("Error fetching data:", result.message);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				navigate("/login");
			}
		};

		fetchData();
	}, [navigate]);

	// Countdown timer for session expiration
	useEffect(() => {
		if (expTime) {
			const interval = setInterval(() => {
				const currentTime = Math.floor(Date.now() / 1000);
				const remainingTime = expTime - currentTime;

				if (remainingTime <= 0) {
					clearInterval(interval);
					navigate("/login");
				} else {
					const minutes = Math.floor(remainingTime / 60);
					const seconds = remainingTime % 60;
					setCountdown(`${minutes}m ${seconds}s`);
				}
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [expTime, navigate]);

	const gotoUser = () => {
		navigate("/user");
	};

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
		<div className="home-container">
			<header className="header-bar">
				<span>Cybersecurity Training Platform</span>
				<div className="button-group">
					<button onClick={gotoUser} className="header-button">
						<img src="/icons/profile_icon.svg" className="profile-icon" />
						{name ?? "???"}
					</button>
					<button
						onClick={handleLogout}
						className="header-button logout-button"
					>
						Logout
					</button>
				</div>
			</header>

			<main className="main-content">
				<h1>Welcome Home!</h1>
				{countdown && <p>Session expires in: {countdown}</p>}
			</main>
		</div>
	);
}
