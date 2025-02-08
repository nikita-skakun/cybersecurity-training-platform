import { Application } from "jsr:@oak/oak";
import { oakCors } from "@tajpouria/cors";
import routeStaticFilesFrom from "./util/static_utils.ts";
import loginRouter from "./routes/login.ts";
import userRouter from "./routes/user.ts";
import quizRouter from "./routes/quiz.ts";
import moduleRouter from "./routes/module.ts";

const app = new Application();

app.use(oakCors());

const routers = [loginRouter, userRouter, quizRouter, moduleRouter];
routers.forEach((router) => {
	app.use(router.routes());
	app.use(router.allowedMethods());
});

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
