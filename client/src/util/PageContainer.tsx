import { Box, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

export default function PageContainer({
	children,
	sx = {},
}: {
	children: ReactNode;
	sx?: SxProps<Theme>;
}) {
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
			<Box
				sx={{
					position: "absolute",
					top: -10,
					left: -10,
					right: -10,
					bottom: -10,
					backgroundImage: "url('/background.jpg')",
					backgroundSize: "cover",
					backgroundPosition: "center",
					filter: "blur(3px)",
					zIndex: -1,
				}}
			/>
			{children}
		</Box>
	);
}
