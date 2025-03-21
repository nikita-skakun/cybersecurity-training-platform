import { Router } from "jsr:@oak/oak";
import { Module } from "@shared/types/module.ts";
import { ItemInfo } from "@shared/types/item.ts";
import { User } from "@shared/types/user.ts";
import { verifyToken } from "../util/jwt_utils.ts";
import { getJson } from "../util/fs_utils.ts";
import {
	listCompletedRequirementsByType,
	listUnlockedRequirements,
	markRequirementCompleted,
} from "../util/db_utils.ts";

const moduleInfoCache: Record<string, ItemInfo> = {};
const moduleCache: Record<string, Module> = {};

// Load a module from file (or from cache if already loaded)
async function fetchModule(id: string): Promise<Module> {
	let moduleData: Module;
	if (moduleCache[id]) {
		moduleData = moduleCache[id];
	} else {
		const filePath = `./training_module/${id}.json`;
		moduleData = (await getJson(filePath)) as Module;
		moduleCache[id] = moduleData;
	}
	return moduleData;
}

async function fetchModuleList(): Promise<Record<string, ItemInfo>> {
	if (Object.keys(moduleInfoCache).length === 0) {
		for await (const entry of Deno.readDir("./training_module")) {
			if (entry.isFile && entry.name.endsWith(".json")) {
				const id = entry.name.replace(".json", "");
				const moduleData = await fetchModule(id);
				const moduleInfo: ItemInfo = moduleData.info;
				moduleInfoCache[id] = moduleInfo;
			}
		}
	}
	return moduleInfoCache;
}

const moduleRouter = new Router();

// GET /api/modules/:id - Return module data
moduleRouter.get("/api/modules/:id", async (context) => {
	const { id } = context.params;

	try {
		const moduleData = await fetchModule(id);
		context.response.status = 200;
		context.response.body = { success: true, module: moduleData };
	} catch (error) {
		console.error("Error loading module file:", error);
		context.response.status = 404;
		context.response.body = { success: false, message: "Module not found" };
	}
});

// POST /api/modules/:id/complete - Mark a module as completed
moduleRouter.post("/api/modules/:id/complete", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);

	if (!payload) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	const userId = payload.id;
	const { id } = context.params;

	try {
		markRequirementCompleted(userId, id, "module");
		context.response.status = 200;
		context.response.body = {
			success: true,
			message: "Module marked as completed",
		};
	} catch (error) {
		console.error("Error marking module as completed:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Failed to mark module as completed",
		};
	}
});

// GET /api/modules - Return a list of modules and separate out completed ones
moduleRouter.get("/api/modules", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");

	const payload = verifyToken<User>(token);

	if (!payload) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	try {
		const allModules = await fetchModuleList();
		const compModuleIds = listCompletedRequirementsByType(payload.id, "module");
		const avlModuleIds = listUnlockedRequirements(payload.id, allModules);

		const compModules: Record<string, ItemInfo> = {};
		for (const moduleId of compModuleIds) {
			if (allModules[moduleId]) {
				compModules[moduleId] = allModules[moduleId];
			}
		}

		const avlModules: Record<string, ItemInfo> = {};
		for (const moduleId of avlModuleIds) {
			if (allModules[moduleId]) {
				avlModules[moduleId] = allModules[moduleId];
			}
		}

		context.response.status = 200;
		context.response.body = { success: true, avlModules, compModules };
	} catch (error) {
		console.error("Error listing modules:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Failed to list modules",
		};
	}
});

// GET /api/moduleCount - Return the number of modules
moduleRouter.get("/api/moduleCount", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");
	const payload = verifyToken<User>(token);
	if (!payload) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
		return;
	}

	try {
		const modules = await fetchModuleList();
		context.response.status = 200;
		context.response.body = {
			success: true,
			count: Object.keys(modules).length,
		};
	} catch (error) {
		console.error("Error fetching module count:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Failed to fetch module count",
		};
	}
});

export default moduleRouter;
