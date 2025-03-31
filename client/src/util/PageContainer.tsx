import { Box, SxProps, Theme } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { User } from "@shared/types/user.ts";

export default function PageContainer({
	children,
	user,
	sx = {},
}: {
	children: ReactNode;
	user: User | null;
	sx?: SxProps<Theme>;
}) {
	const [backgroundId, setBackgroundId] = useState<number>(1);

	useEffect(() => {
		if (!user) return;

		const savedBackground = localStorage.getItem("preferredBackground");
		if (savedBackground) {
			setBackgroundId(parseInt(savedBackground, 10));
		} else if (user && user.id) {
			fetch("/api/users/background")
				.then((response) => response.json())
				.then((data) => {
					console.log("Background ID from server:", data.backgroundId);
					setBackgroundId(data.backgroundId);
					localStorage.setItem("preferredBackground", data.backgroundId);
				})
				.catch((error) => console.error("Error fetching background:", error));
		}
	}, [user]);
	return (
		<Box
			sx={{
				position: "relative",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				p: 2,
				overflow: "hidden",
				...sx,
			}}
		>
			{backgroundId !== 0 && (
				<Box
					sx={{
						position: "absolute",
						top: -10,
						left: -10,
						right: -10,
						bottom: -10,
						backgroundImage: `url('/backgrounds/${backgroundId}.jpg')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						filter: "blur(3px)",
						zIndex: -1,
					}}
				/>
			)}
			{children}
		</Box>
	);
}
