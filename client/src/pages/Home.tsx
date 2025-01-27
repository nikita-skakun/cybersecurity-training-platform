import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
	const [name, setName] = useState("");
	const navigate = useNavigate();

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
				<button onClick={handleLogout} className="logout-button">
					Logout
				</button>
			</header>

			<main className="main-content">
				<h1>Welcome Home!</h1>
				{name && <p>Hello, {name}!</p>}
			</main>
		</div>
	);
}
