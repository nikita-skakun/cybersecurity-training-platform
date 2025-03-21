import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Module, Page } from "@shared/types/module.ts";
import "./Module.css";

export default function ModulePage() {
	const { id } = useParams<{ id: string }>();
	const user = useUserData();
	const navigate = useNavigate();

	const [module, setModule] = useState<Module | null>(null);
	const [currentPageIndex, setCurrentPageIndex] = useState(0);
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		fetch(`/api/modules/${id}`)
			.then((res) => res.json())
			.then((data) => setModule(data.module))
			.catch((err) => console.error("Failed to load module:", err));
	}, [id]);

	if (!module) return <div>Loading module...</div>;

	const handleNext = () => {
		if (currentPageIndex < module.pages.length - 1) {
			setCurrentPageIndex(currentPageIndex + 1);
		}
	};

	const handleBack = () => {
		if (currentPageIndex > 0) {
			setCurrentPageIndex(currentPageIndex - 1);
		}
	};

	const handleComplete = () => {
		fetch(`/api/modules/${id}/complete`, { method: "POST" });
		setCompleted(true);
	};

	const currentPage: Page = module.pages[currentPageIndex];

	let progress = (currentPageIndex / module.pages.length) * 100;
	if (completed) progress = 100;

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="fullsize-container">
				<div className="progress-bar-container">
					<div className="progress-bar" style={{ width: `${progress}%` }}></div>
				</div>

				{completed ? (
					<>
						<h2>{module.info.title}</h2>
						<h3>Module Completed!</h3>
						<p>{module.info.description}</p>
						<div className="button-group center margins-all-but-down">
							<button
								type="button"
								onClick={() => globalThis.location.reload()}
							>
								<img
									src="/icons/reload_icon.svg"
									className="icon"
									alt="Reload"
								/>
								Try Again
							</button>
							<button type="button" onClick={() => navigate("/")}>
								<img src="/icons/back_icon.svg" className="icon" alt="Back" />
								Home
							</button>
						</div>
					</>
				) : (
					<>
						<h1>{currentPage.title}</h1>
						{currentPage.content && (
							<div className="center">
								<p className="module-text">{currentPage.content}</p>
							</div>
						)}
						{currentPage.videos && (
							<div className="image-group center margins-all-but-down">
								{currentPage.videos.map((video, idx) => (
									<video key={idx} controls>
										<source src={video} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								))}
							</div>
						)}

						{currentPage.images && (
							<div className="image-group center margins-all-but-down">
								{currentPage.images.map((img, idx) => (
									<img
										key={idx}
										src={img}
										className="module-image"
										alt={`Media ${idx}`}
									/>
								))}
							</div>
						)}

						<div className="button-group center margins-all-but-down">
							<button
								type="button"
								onClick={handleBack}
								disabled={currentPageIndex === 0}
							>
								&lt; Back
							</button>
							{currentPageIndex === module.pages.length - 1 ? (
								<button type="button" onClick={handleComplete}>
									Finish &gt;
								</button>
							) : (
								<button type="button" onClick={handleNext}>
									Next &gt;
								</button>
							)}
						</div>
					</>
				)}
			</main>
		</div>
	);
}
