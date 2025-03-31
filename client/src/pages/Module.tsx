import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserData } from "../util/ApiUtils.ts";
import { TitleBar } from "../util/TitleBar.tsx";
import { Module, Page } from "@shared/types/module.ts";
import ReactMarkdown from "react-markdown";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Paper,
	Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";
import PageContainer from "../util/PageContainer.tsx";

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
			navigate("/home");
		} else {
			setCurrentPageIndex(currentPageIndex - 1);
		}
	};

	const handleComplete = () => {
		fetch(`/api/modules/${id}/complete`, { method: "POST" });
		setCompleted(true);
	};

	const currentPage: Page = module.pages[currentPageIndex];

	return (
		<>
			<TitleBar user={user} />
			<PageContainer sx={{ alignItems: "center", height: "100vh" }} user={user}>
				<Paper
					elevation={4}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						mt: 8,
						p: 4,
						width: completed ? "auto" : "100%",
						maxWidth: { xs: "90%", md: "1200px" },
						backdropFilter: "blur(40px)",
						borderRadius: 4,
					}}
				>
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
							<Box sx={{ flexGrow: 1 }} />
							<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
								<Button
									variant="outlined"
									onClick={() => globalThis.location.reload()}
									startIcon={<ReplayIcon />}
								>
									Try Again
								</Button>
								<Button
									variant="outlined"
									onClick={() => navigate("/home")}
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
							{currentPage.title && (
								<Typography variant="h5" gutterBottom>
									{currentPage.title}
								</Typography>
							)}
							{currentPage.content && (
								<Box
									sx={{
										mb: 3,
										textAlign: "left",
										width: "100%",
										maxHeight: { xs: "300px", sm: "400px", md: "500px" },
										overflowY: "auto",
										"&::-webkit-scrollbar": {
											width: "4px",
											backgroundColor: "transparent",
										},
										"&::-webkit-scrollbar-thumb": {
											backgroundColor: "rgba(255,255,255,0.2)",
											borderRadius: "4px",
											transition: "background-color 0.2s",
										},
									}}
									className="md-text"
								>
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
							<Box sx={{ flexGrow: 1 }} />
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Button
									variant="outlined"
									onClick={handleBack}
									startIcon={<ChevronLeftIcon />}
								>
									{currentPageIndex === 0 ? "Home" : "Back"}
								</Button>
								<Chip
									label={`Page ${currentPageIndex + 1} of ${
										module.pages.length
									}`}
								></Chip>
								<Button
									variant="outlined"
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
				</Paper>
			</PageContainer>
		</>
	);
}
