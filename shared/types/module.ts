export interface Page {
	title: string;
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
