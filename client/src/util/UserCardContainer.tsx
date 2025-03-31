import { AdminUserInfo } from "@shared/types/user.ts";
import UserCard from "./UserCard.tsx";
import { Grid } from "@mui/material";

interface UserCardContainerProps {
	users: AdminUserInfo[];
	quizCount: number;
	moduleCount: number;
}

export default function UserCardContainer(props: UserCardContainerProps) {
	return (
		<Grid container spacing={2}>
			{props.users.map((user) => (
				<Grid
					size={{ xs: 12, sm: 6 }}
					key={user.id + "-" + user.username}
					sx={{ display: "flex", justifyContent: "center" }}
				>
					<UserCard
						user={user}
						quizCount={props.quizCount}
						moduleCount={props.moduleCount}
					/>
				</Grid>
			))}
		</Grid>
	);
}
