export interface Question {
	question: string;
	type: "single" | "multiple";
	options: string[];
	answer?: string | string[];
}

export interface QuizInfo {
	title: string;
	description: string;
	requirements: string[];
	questionCount: number;
}

export interface Quiz {
	quizInfo: QuizInfo;
	questions: Question[];
}

export interface UserAnswers {
	[key: number]: string | string[];
}
