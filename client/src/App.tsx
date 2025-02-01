import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import User from "./pages/User.tsx";
import Quiz from "./pages/Quiz.tsx";
import "./App.css";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/user" element={<User />} />
				<Route path="/quiz/:id/*" element={<Quiz />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
