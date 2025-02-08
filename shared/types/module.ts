import { ItemInfo } from "@shared/types/item.ts";

export interface Page {
	title: string;
	content?: string;
	images?: string[];
	videos?: string[];
}

export interface Module {
	info: ItemInfo;
	pages: Page[];
}
