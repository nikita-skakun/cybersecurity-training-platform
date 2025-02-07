export interface Page {
	title: string;
	type: "cover" | "media_text" | "text" | "media";
	content?: string;
	images?: string[];
	videos?: string[];
}

export interface ModuleInfo {
	title: string;
	description: string;
	requirements: string[];
	pageCount: number;
}

export interface Module {
	moduleInfo: ModuleInfo;
	pages: Page[];
}
