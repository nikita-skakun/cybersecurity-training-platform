import { Router } from "jsr:@oak/oak";
import { Module, ModuleInfo } from "@shared/types/module.ts";
import { verifyToken } from "../util/jwt_utils.ts";
import { User } from "@shared/types/user.ts";
import {
	listCompletedRequirementsByType,
	markRequirementCompleted,
} from "../util/db_utils.ts";
import { getJson } from "../util/fs_utils.ts";

const moduleInfoCache: Record<string, ModuleInfo> = {};
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

// Build a cache of all available modules
async function fetchModuleInfoList(): Promise<Record<string, ModuleInfo>> {
	if (Object.keys(moduleInfoCache).length === 0) {
		for await (const entry of Deno.readDir("./training_module")) {
			if (entry.isFile && entry.name.endsWith(".json")) {
				const id = entry.name.replace(".json", "");
				const moduleData = await fetchModule(id);
				const moduleInfo: ModuleInfo = moduleData.moduleInfo;
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
		const moduleList = await fetchModuleInfoList();
		const compModuleIdList = listCompletedRequirementsByType(
			payload.id,
			"module"
		);
		const compModuleList: Record<string, ModuleInfo> = {};

		for (const moduleId of compModuleIdList) {
			if (moduleList[moduleId]) {
				compModuleList[moduleId] = moduleList[moduleId];
				delete moduleList[moduleId];
			}
		}

		context.response.status = 200;
		context.response.body = {
			success: true,
			moduleList,
			compModuleList,
		};
	} catch (error) {
		console.error("Error listing modules:", error);
		context.response.status = 500;
		context.response.body = {
			success: false,
			message: "Failed to list modules",
		};
	}
});

export default moduleRouter;
