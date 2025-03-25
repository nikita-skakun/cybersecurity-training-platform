import { assertEquals, assertNotEquals } from "jsr:@std/assert";

import { authenticateUser } from "@server/routes/login.ts";

Deno.test("Test user can login", async () => {
	const email = "test@example.com";
	const password = "test";

	const user = await authenticateUser(email, password, true);

	// Verify that a user object is returned
	assertNotEquals(
		user,
		null,
		"User should not be null for valid test credentials"
	);

	if (user) {
		// Check expected properties for the test user
		assertEquals(user.name, "Test User");
		assertEquals(user.role, "user");
		assertEquals(user.companyName, "Test Company");
		assertEquals(user.username, "test");
		assertEquals(user.domain, "example.com");
	}
});
