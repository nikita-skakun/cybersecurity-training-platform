import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#ffffff",
		},
		background: {
			default: "#121212",
			paper: "rgba(0, 0, 0, 0.6)",
		},
		text: {
			primary: "rgba(255, 255, 255, 0.8)",
			secondary: "rgba(255, 255, 255, 0.6)",
		},
	},
	components: {
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					color: "rgba(255, 255, 255, 0.8)",
					"& .MuiInputLabel-root": {
						color: "rgba(255, 255, 255, 0.8)",
					},
					"& fieldset": {
						borderColor: "rgba(255, 255, 255, 0.8)",
					},
					"&:hover fieldset": {
						borderColor: "rgba(255, 255, 255, 1)",
					},
					"&.Mui-focused fieldset": {
						borderColor: "rgba(255, 255, 255, 1)",
					},
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: "rgba(255, 255, 255, 0.8)",
					borderColor: "rgba(255, 255, 255, 0.8)",
				},
			},
		},
	},
});

export default theme;
