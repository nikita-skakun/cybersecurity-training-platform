import { useNavigate } from "react-router-dom";
import { AdminUserInfo } from "@shared/types/user.ts";
import "./UserCard.css";

export interface UserCardProps extends AdminUserInfo {}

export default function UserCard({ id, name, username }: UserCardProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/admin/users/${id}`);
	};

	const handleSendTestEmail = (e: React.MouseEvent) => {
		e.stopPropagation(); // prevent card click

		fetch(`/api/sendTestEmail/${id}`, { method: "POST" })
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`Test email sent to ${username}`);
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
				<h2 className="user-name">{name}</h2>
				<p className="user-username">@{username}</p>
			</div>
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
