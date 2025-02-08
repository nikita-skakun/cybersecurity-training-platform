import { ItemInfo } from "@shared/types/item.ts";

export interface Question {
	question: string;
	type: "single" | "multiple";
	options: string[];
	answer?: string | string[];
}

export interface Quiz {
	info: ItemInfo;
	questions: Question[];
}

export interface UserAnswers {
	[key: number]: string | string[];
}
