import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/api_utils.ts";
import "./User.css";

export default function UserPage() {
	const navigate = useNavigate();
	const user = useUserData();

	return (
		<div className="page-container">
			<main className="shrunk-container">
				<h1>User Profile</h1>

				{!user ? (
					<p>Loading user data...</p>
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
					<img src="/icons/back_icon.svg" className="icon" />
					Home
				</button>
			</main>
		</div>
	);
}
