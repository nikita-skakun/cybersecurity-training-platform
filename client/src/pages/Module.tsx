import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Module, Page } from "@shared/types/module.ts";
import ReactMarkdown from "react-markdown";
import {
	Box,
	Button,
	CircularProgress,
	Container,
	LinearProgress,
	Paper,
	Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";

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

	if (!module) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</div>
		);
	}

	const handleNext = () => {
		if (currentPageIndex < module.pages.length - 1) {
			setCurrentPageIndex(currentPageIndex + 1);
		}
	};

	const handleBack = () => {
		if (currentPageIndex === 0) {
			navigate("/");
		} else {
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
		<>
			<TitleBar user={user} />
			<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
					>
						{/* Progress Bar */}
						<Box sx={{ width: "100%", mb: 3 }}>
							<LinearProgress variant="determinate" value={progress} />
						</Box>

						{completed ? (
							<>
								<Typography variant="h4" gutterBottom>
									{module.info.title}
								</Typography>
								<Typography variant="h5" gutterBottom>
									Module Completed!
								</Typography>
								<Typography variant="body1" sx={{ mb: 3 }}>
									Congratulations! You can now attempt the relevant quiz or
									another module from the home screen.
								</Typography>
								<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
									<Button
										variant="outlined"
										color="primary"
										onClick={() => globalThis.location.reload()}
										startIcon={<ReplayIcon />}
									>
										Try Again
									</Button>
									<Button
										variant="contained"
										color="primary"
										onClick={() => navigate("/")}
										startIcon={<HomeIcon />}
									>
										Home
									</Button>
								</Box>
							</>
						) : (
							<>
								<Typography variant="h4" gutterBottom>
									{module.info.title}
								</Typography>
								<Typography variant="h5" gutterBottom>
									{currentPage.title}
								</Typography>
								{currentPage.content && (
									<Box sx={{ mb: 3, textAlign: "left", width: "100%" }} className="md-text">
										<ReactMarkdown>{currentPage.content}</ReactMarkdown>
									</Box>
								)}
								{currentPage.videos && (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											gap: 2,
											mb: 3,
											flexWrap: "wrap",
										}}
									>
										{currentPage.videos.map((video, idx) => (
											<video
												key={idx}
												controls
												style={{ maxWidth: "100%", borderRadius: 8 }}
											>
												<source src={video} type="video/mp4" />
												Your browser does not support the video tag.
											</video>
										))}
									</Box>
								)}
								{currentPage.images && (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											gap: 2,
											mb: 3,
											flexWrap: "wrap",
										}}
									>
										{currentPage.images.map((img, idx) => (
											<img
												key={idx}
												src={img}
												alt={`Media ${idx}`}
												style={{ maxWidth: "100%", borderRadius: 8 }}
											/>
										))}
									</Box>
								)}
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<Button
										variant="contained"
										onClick={handleBack}
										startIcon={<ChevronLeftIcon />}
									>
										{currentPageIndex === 0 ? "Home" : "Back"}
									</Button>
									<Button
										variant="contained"
										onClick={
											currentPageIndex === module.pages.length - 1
												? handleComplete
												: handleNext
										}
										endIcon={<ChevronRightIcon />}
									>
										{currentPageIndex === module.pages.length - 1
											? "Finish"
											: "Next"}
									</Button>
								</Box>
							</>
						)}
					</Box>
				</Paper>
			</Container>
		</>
	);
}
