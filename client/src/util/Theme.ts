import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "rgb(250,250, 250)",
		},
		secondary: {
			main: "rgba(250, 250, 250, 0.8)",
		},
		background: {
			default: "rgb(9, 9, 11)",
			paper: "rgb(9, 9, 11)",
		},
		text: {
			primary: "rgb(250, 250, 250)",
			secondary: "rgba(250, 250, 250, 0.8)",
		},
	},
	components: {
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					color: "rgba(255, 255, 255, 0.8)",
					"& .MuiInputLabel-root": {
						borderColor: "rgb(39, 39, 42)",
					},
					"& fieldset": {
						borderColor: "rgb(39, 39, 42)",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "rgb(39, 39, 42)",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "rgb(250, 250, 250)",
						borderWidth: "1px",
					},
				},
			},
		},
		MuiButton: {
			defaultProps: {
				disableRipple: true,
			},
			styleOverrides: {
				root: {
					color: "rgb(250, 250, 250)",
					borderColor: "rgb(39, 39, 42)",
					background: "rgb(39, 39, 42)",
					borderRadius: "6px",
				},
				outlined: {
					background: "rgb(9, 9, 11)",
					"&:hover": {
						background: "rgb(39, 39, 42)",
						transition: "background 0.2s",
					},
				},
				contained: {
					"&:hover": {
						transition: "opacity 0.2s",
						opacity: 0.9,
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					background: "rgb(9, 9, 11)",
					borderRadius: "16px",
					borderColor: "rgb(39, 39, 42)",
					borderWidth: "1px",
					borderStyle: "solid",
				},
			},
		},
	},
});

export default theme;
