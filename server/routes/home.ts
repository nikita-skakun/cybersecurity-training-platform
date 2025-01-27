import { Router } from "jsr:@oak/oak";
import jwt from "jsonwebtoken";

const homeRouter = new Router();

homeRouter.get("/api/home", async (context) => {
	const cookies = context.cookies;
	const token = await cookies.get("jwtCyberTraining");

	if (!token) {
		context.response.status = 401;
		context.response.body = {
			success: false,
			message: "Unauthorized, no token provided",
		};
		return;
	}

	try {
		const payload = await jwt.verify(token, "secret");
		context.response.status = 200;
		context.response.body = {
			success: true,
			message: "Protected content",
			user: payload,
		};
	} catch (_) {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
	}
});

export default homeRouter;
