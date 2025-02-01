import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");

		const response = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const result = await response.json();

		if (result.success) {
			navigate("/");
		} else {
			setError(result.message);
		}
	};
	return (
		<div className="flex-center">
			<main className="login-container">
				<div className="login-header">
					<h1>Cybersecurity Training Platform</h1>
				</div>
				<div className="login-card">
					<h2>Login</h2>
					<form onSubmit={handleSubmit} className="login-form">
						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="form-group">
							<label htmlFor="password">Password</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<button
							type="submit"
							className="login-button"
							disabled={!email || !password}
						>
							Login
						</button>
						{error && <p className="error-message">{error}</p>}
					</form>
				</div>
			</main>
		</div>
	);
}
