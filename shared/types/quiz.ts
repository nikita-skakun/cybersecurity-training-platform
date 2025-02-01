export interface Question {
	question: string;
	type: "single" | "multiple";
	options: string[];
	answer?: string | string[];
}

export interface Quiz {
	title: string;
	questions: Question[];
}

export interface UserAnswers {
	[key: number]: string | string[];
}