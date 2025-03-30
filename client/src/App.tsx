import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login.tsx";
import HomePage from "./pages/Home.tsx";
import UserPage from "./pages/User.tsx";
import QuizPage from "./pages/Quiz.tsx";
import ModulePage from "./pages/Module.tsx";
import PhishPage from "./pages/Phish.tsx";
import theme from "./util/Theme.ts";
import "./App.css";
import { CssBaseline, ThemeProvider } from "@mui/material";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/user" element={<UserPage />} />
					<Route path="/quiz/:id/*" element={<QuizPage />} />
					<Route path="/module/:id/*" element={<ModulePage />} />
					<Route path="/process/:uuid/*" element={<PhishPage />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
