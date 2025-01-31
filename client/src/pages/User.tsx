import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";
import "./User.css";

export default function UserPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Fetch user data on component mount
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch("/api/userData", {
					method: "GET",
					credentials: "include",
				});

				const result = await response.json();

				if (result.success) {
					setUser(result.user);
				} else {
					throw new Error(result.message);
				}
			} catch (error) {
				setError("Failed to load user data.");
				console.error("Error fetching user data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	return (
		<div className="page-container">
			<main className="shrunk-container">
				<h1>User Profile</h1>

				{loading ? (
					<p>Loading user data...</p>
				) : error ? (
					<p className="error-message">{error}</p>
				) : user ? (
					<div className="user-info">
						<p>
							<strong>Username:</strong> {user.username}
						</p>
						<p>
							<strong>Name:</strong> {user.name}
						</p>
						<p>
							<strong>Domain:</strong> {user.domain}
						</p>
						<p>
							<strong>Role:</strong> {user.role}
						</p>
					</div>
				) : (
					<p>No user data available.</p>
				)}
				<button onClick={() => navigate("/")}>
					← Home
				</button>
			</main>
		</div>
	);
}
