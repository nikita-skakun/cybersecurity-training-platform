import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import LoginPage from "./pages/Login.tsx";
import HomePage from "./pages/Home.tsx";
import UserPage from "./pages/User.tsx";
import QuizPage from "./pages/Quiz.tsx";
import ModulePage from "./pages/Module.tsx";
import PhishPage from "./pages/Phish.tsx";
import CertificatePage from "./pages/Certificate.tsx";
import LandingPage from "./pages/Landing.tsx";
import theme from "./util/Theme.ts";
import "./App.css";

const defaultTheme = createTheme();

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/certificate/:id/*"
					element={
						<ThemeProvider theme={defaultTheme}>
							<CssBaseline />
							<CertificatePage />
						</ThemeProvider>
					}
				/>
				<Route
					path="*"
					element={
						<ThemeProvider theme={theme}>
							<CssBaseline />
							<Routes>
								<Route path="/" element={<LandingPage />} />
								<Route path="/home" element={<HomePage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/user" element={<UserPage />} />
								<Route path="/quiz/:id/*" element={<QuizPage />} />
								<Route path="/module/:id/*" element={<ModulePage />} />
								<Route path="/process/:uuid/*" element={<PhishPage />} />
							</Routes>
						</ThemeProvider>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
