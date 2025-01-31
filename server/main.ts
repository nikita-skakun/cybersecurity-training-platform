import { Application } from "jsr:@oak/oak";
import { oakCors } from "@tajpouria/cors";
import routeStaticFilesFrom from "./util/static_utils.ts";
import loginRouter from "./routes/login.ts";
import userRouter from "./routes/user.ts";

const app = new Application();

app.use(oakCors());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());
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
