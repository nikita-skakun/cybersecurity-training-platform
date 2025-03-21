import { AdminUserInfo } from "@shared/types/user.ts";
import UserCard from "./UserCard.tsx";
import "./UserCardContainer.css";

interface UserCardContainerProps {
	users: AdminUserInfo[];
	quizCount: number;
	moduleCount: number;
}

export default function UserCardContainer(props: UserCardContainerProps) {
	return (
		<div className="user-card-container">
			{props.users.map((user) => (
				<UserCard
					key={user.id}
					user={user}
					quizCount={props.quizCount}
					moduleCount={props.moduleCount}
				/>
			))}
		</div>
	);
}
