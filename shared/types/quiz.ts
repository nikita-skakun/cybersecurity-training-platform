export interface Question {
	question: string;
	type: "single" | "multiple";
	options: string[];
	answer?: string | string[];
}

export interface Quiz {
	title: string;
	description: string;
	questions: Question[];
}

export interface QuizInfo {
	title: string;
	description: string;
	questionCount: number;
}

export interface UserAnswers {
	[key: number]: string | string[];
}
