import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/api_utils.ts";
import "./Home.css";

export default function Home() {
	const [countdown, setCountdown] = useState("");
	const navigate = useNavigate();
	const user = useUserData();

	// Countdown timer for session expiration
	useEffect(() => {
		if (user?.exp) {
			const interval = setInterval(() => {
				const currentTime = Math.floor(Date.now() / 1000);
				const remainingTime = user.exp - currentTime;

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
		<div className="page-container">
			<header className="header-bar">
				<span>Cybersecurity Training Platform</span>
				<div className="button-group">
					<div className="tooltip-container">
						<button onClick={() => navigate("/user")}>
							<img src="/icons/profile_icon.svg" className="profile-icon" />
							{user?.name ?? "???"}
						</button>
						<span className="tooltip-text">
							Session expires in: {countdown ?? "???"}
						</span>
					</div>
					<button onClick={handleLogout} className="red-button">
						Logout
					</button>
				</div>
			</header>

			<main className="fullsize-content">
				<h1>Welcome Home!</h1>
			</main>
		</div>
	);
}
