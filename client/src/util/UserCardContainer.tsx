import { AdminUserInfo } from "@shared/types/user.ts";
import UserCard from "./UserCard.tsx";
import "./UserCardContainer.css";

interface UserCardContainerProps {
	users: AdminUserInfo[];
}

export default function UserCardContainer({ users }: UserCardContainerProps) {
	return (
		<div className="user-card-container">
			{users.map((user) => (
				<UserCard key={user.id} {...user} />
			))}
		</div>
	);
}
