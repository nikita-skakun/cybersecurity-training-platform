import { useNavigate } from "react-router-dom";
import { AdminUserInfo } from "@shared/types/user.ts";
import "./UserCard.css";

interface UserCardProps {
	user: AdminUserInfo;
	quizCount: number;
	moduleCount: number;
}

export default function UserCard({
	user,
	quizCount,
	moduleCount,
}: UserCardProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		// TODO: Navigate to user details page
		// navigate(`/admin/users/${user.id}`);
	};

	const handleSendPhishingEmail = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (user.id < 0) {
			alert("User never logged in");
			return;
		}

		fetch("/api/sendPhishingEmail", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: user.username,
				name: user.name,
				userId: user.id,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`Test email sent to ${user.username}`);
				} else {
					alert(`Failed to send email: ${data.message}`);
				}
			})
			.catch((err) => {
				console.error("Error sending test email:", err);
				alert("Error sending test email");
			});
	};

	return (
		<div className="user-card" onClick={handleClick}>
			<div className="user-info">
				<h2 className="user-name">{user.name}</h2>
				<p className="user-username">@{user.username}</p>
			</div>

			{user.id < 0 ? (
				<p className="red-box">User never logged in</p>
			) : (
				<>
					<div>
						<p>
							{"🎯: "}
							<span
								className={
									(user.avgScore ?? 0) < 50
										? "red-box"
										: (user.avgScore ?? 0) > 90
										? "green-box"
										: "yellow-box"
								}
							>
								{(user.avgScore ?? 0).toFixed(2)}%
							</span>
						</p>
					</div>
					<div>
						<p>
							{"📝: "}
							<span
								className={
									(user.compQuizzes ?? 0) / quizCount < 0.5
										? "red-box"
										: (user.compQuizzes ?? 0) / quizCount > 0.9
										? "green-box"
										: "yellow-box"
								}
							>
								{user.compQuizzes} / {quizCount}
							</span>
						</p>
					</div>
					<div>
						<p>
							{"📖: "}
							<span
								className={
									(user.compModules ?? 0) / moduleCount < 0.5
										? "red-box"
										: (user.compModules ?? 0) / moduleCount > 0.9
										? "green-box"
										: "yellow-box"
								}
							>
								{user.compModules} / {moduleCount}
							</span>
						</p>
					</div>
					<div>
						<p>
							{"🎣: "}
							<span
								className={
									(user.phishingClicked ?? 0) > 0 ? "red-box" : "green-box"
								}
							>
								{user.phishingClicked} / {user.phishingSent}
							</span>
						</p>
					</div>
				</>
			)}

			<button
				type="button"
				className="email-button"
				onClick={handleSendPhishingEmail}
				disabled={user.id < 0}
			>
				Phish
			</button>
		</div>
	);
}
