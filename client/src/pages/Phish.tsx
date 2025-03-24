import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

export default function PhishPage() {
	const { uuid } = useParams<{ uuid: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (uuid) {
			fetch(`/api/phishCaught/${uuid}`, {
				method: "POST",
			}).catch((error) => {
				console.error("Error reporting phishing simulation:", error);
			});
		}
	}, [uuid]);

	return (
		<div className="page-container">
			<main className="shrunk-container">
				<div className="center">
					<h1>You Failed the Phishing Test</h1>
				</div>
				<div className="center">
					<p className="warning-text">
						You have been caught in our phishing simulation! This exercise is
						designed to help you recognize phishing attempts and improve your
						cybersecurity awareness. Remember to always verify links and sender
						information before clicking or providing sensitive information.
					</p>
				</div>
				<div className="center">
					<button
						type="button"
						className="margins-all-but-down"
						onClick={() => navigate("/")}
					>
						<img src="/icons/back_icon.svg" className="icon" alt="Back" />
						Landing Page
					</button>
				</div>
			</main>
		</div>
	);
}
