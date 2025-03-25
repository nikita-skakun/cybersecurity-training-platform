import { assertEquals, assertNotEquals } from "jsr:@std/assert";

import { authenticateUser } from "@server/routes/login.ts";

Deno.test("Test user can login", async () => {
	const email = "test@example.com";
	const password = "test";

	const user = await authenticateUser(email, password, true);

	assertNotEquals(
		user,
		null,
		"User should not be null for valid test credentials"
	);

	if (user) {
		assertEquals(user.name, "Test User");
		assertEquals(user.role, "user");
		assertEquals(user.companyName, "Test Company");
		assertEquals(user.username, "test");
		assertEquals(user.domain, "example.com");
	}
});

Deno.test("Test user cannot login with invalid credentials", async () => {
	const email = "invalid@example.com";
	const password = "wrong_password";

	const user = await authenticateUser(email, password, true);

	assertEquals(
		user,
		null,
		"User should be null for invalid test credentials"
	);
});