import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login.tsx";
import HomePage from "./pages/Home.tsx";
import UserPage from "./pages/User.tsx";
import QuizPage from "./pages/Quiz.tsx";
import ModulePage from "./pages/Module.tsx";
import PhishPage from "./pages/Phish.tsx";
import "./App.css";

function App() {
	return (
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
	);
}

export default App;
