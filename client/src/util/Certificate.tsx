import { useRef } from "react";
import {
	Card,
	CardContent,
	Typography,
	Box,
	Divider,
	Button,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";

const CertificateOfCompletion = ({
	employeeName,
	section,
	quizScore,
}: {
	employeeName: string;
	section: string;
	quizScore: number;
}) => {
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

	const contentRef = useRef<HTMLDivElement>(null);

	const handleDownloadPDF = useReactToPrint({
		documentTitle: `${section} Certificate - ${employeeName}`,
		contentRef,
	});

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				m: 8,
			}}
		>
			<Box
				ref={contentRef}
				sx={{ display: "flex", justifyContent: "center", m: 4 }}
			>
				<Card sx={{ width: 800, p: 3, border: "2px solid #1976d2" }}>
					<CardContent>
						<Typography
							variant="h4"
							align="center"
							sx={{ color: "#000" }}
							gutterBottom
						>
							Certificate of Completion
						</Typography>
						<Divider sx={{ my: 2 }} />
						<Typography
							variant="h6"
							align="center"
							sx={{ color: "#000" }}
							gutterBottom
						>
							Cybersecurity Training Platform
						</Typography>
						<Typography
							variant="subtitle1"
							align="center"
							sx={{ color: "#333" }}
							gutterBottom
						>
							echo-shield.com
						</Typography>

						<Box sx={{ my: 3, textAlign: "center", color: "#000" }}>
							<Typography variant="body1">This certifies that</Typography>
							<Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
								{employeeName || "Employee Name"}
							</Typography>
							<Typography variant="body1" sx={{ mt: 2 }}>
								has successfully completed the module and quiz for the section:
							</Typography>
							<Typography variant="h6" sx={{ fontStyle: "italic", mt: 1 }}>
								{section}
							</Typography>
							<Typography variant="body1" sx={{ mt: 2 }}>
								Quiz Score: {quizScore ?? 0}%
							</Typography>
						</Box>

						<Box sx={{ mt: 4, textAlign: "center", color: "#000" }}>
							<Typography variant="body2">Date: {today}</Typography>
						</Box>
					</CardContent>
				</Card>
			</Box>

			<Button
				variant="contained"
				color="primary"
				onClick={() => handleDownloadPDF()}
			>
				Download as PDF
			</Button>
		</Box>
	);
};

export default CertificateOfCompletion;
