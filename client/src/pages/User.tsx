import { useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";

export default function UserPage() {
	const navigate = useNavigate();
	const user = useUserData();

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="shrunk-container">
				<h1>User Profile {user ? `| ${user.name}` : ""}</h1>

				{!user ? (
					<p>Loading user data...</p>
				) : user ? (
					<div className="user-info">
						<p>
							<strong>Username:</strong> {user.username}
						</p>
						<p>
							<strong>Company:</strong> {user.companyName}
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
				<button type="button" onClick={() => navigate("/")}>
					<img src="/icons/back_icon.svg" className="icon" />
					Home
				</button>
			</main>
		</div>
	);
}
