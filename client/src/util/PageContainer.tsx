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
				minHeight: "90vh",
				display: "flex",
				justifyContent: "center",
				overflow: "hidden",
				...sx,
			}}
		>
			{children}
		</Box>
	);
}
