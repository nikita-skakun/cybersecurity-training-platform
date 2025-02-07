import { Router } from "jsr:@oak/oak";
import { verifyToken } from "../util/jwt_utils.ts";
import { User } from "@shared/types/user.ts";

const userRouter = new Router();

userRouter.get("/api/userData", async (context) => {
	const token = await context.cookies.get("jwtCyberTraining");

	const payload = verifyToken<User>(token);
	if (payload) {
		context.response.status = 200;
		context.response.body = {
			success: true,
			message: "Protected content",
			user: payload,
		};
	} else {
		context.response.status = 403;
		context.response.body = { success: false, message: "Invalid token" };
	}
});

export default userRouter;
