import { AdminUserInfo } from "@shared/types/user.ts";
import UserCard from "./UserCard.tsx";
import { Box } from "@mui/material";

interface UserCardContainerProps {
	users: AdminUserInfo[];
	quizCount: number;
	moduleCount: number;
}

export default function UserCardContainer(props: UserCardContainerProps) {
	return (
		<Box
			component="section"
			sx={{
				display: "grid",
				gap: 3,
				gridTemplateColumns: {
					xs: "1fr",
					md: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
					xl: "repeat(4, 1fr)",
				},
			}}
		>
			{props.users.map((user) => (
				<UserCard
					user={user}
					quizCount={props.quizCount}
					moduleCount={props.moduleCount}
					key={user.id + "-" + user.username}
				/>
			))}
		</Box>
	);
}
