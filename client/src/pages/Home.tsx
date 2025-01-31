import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";
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
				const response = await fetch("/api/userData", {
					method: "GET",
					credentials: "include",
				});

				const result = await response.json();

				if (result.success) {
					const userData: User = result.user;
					setName(userData.name);
					setExpTime(userData.exp);
				} else {
					throw new Error(result.message);
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
					const hours = Math.floor(remainingTime / 3600);
					const minutes = Math.floor(remainingTime / 60) % 60;
					const seconds = remainingTime % 60;
					setCountdown(`${hours}h ${minutes}m ${seconds}s`);
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
		<div className="page-container">
			<header className="header-bar">
				<span>Cybersecurity Training Platform</span>
				<div className="button-group">
					<div className="tooltip-container">
						<button onClick={gotoUser}>
							<img src="/icons/profile_icon.svg" className="profile-icon" />
							{name ?? "???"}
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
