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

	const handleSendTestEmail = (e: React.MouseEvent) => {
		e.stopPropagation();

		fetch(`/api/sendTestEmail/${user.id}`, { method: "POST" })
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
							{"Average Score: "}
							<span
								className={
									(user.avgScore ?? 0) < 50
										? "red-box"
										: (user.avgScore ?? 0) > 90
										? "green-box"
										: "yellow-box"
								}
							>
								{user.avgScore ?? 0}%
							</span>
						</p>
					</div>
					<div>
						<p>
							{"Quizzes: "}
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
							{"Modules: "}
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
				</>
			)}

			<button
				type="button"
				className="email-button"
				onClick={handleSendTestEmail}
			>
				Send Email
			</button>
		</div>
	);
}
