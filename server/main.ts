import { Application } from "jsr:@oak/oak";
import { oakCors } from "@tajpouria/cors";
import routeStaticFilesFrom from "./util/route_static_files_from.ts";
import loginRouter from "./routes/login.ts";
import homeRouter from "./routes/home.ts";

const app = new Application();

app.use(oakCors());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(homeRouter.routes());
app.use(homeRouter.allowedMethods());
app.use(
	routeStaticFilesFrom([
		`${Deno.cwd()}/client/dist`,
		`${Deno.cwd()}/client/public`,
	])
);

if (import.meta.main) {
	console.log("Backend listening on port http://localhost:8000");
	await app.listen({ port: 8000 });
}
