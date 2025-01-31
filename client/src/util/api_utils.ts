import { User } from "@shared/types/user.ts";

export async function fetchUserData(): Promise<User | null> {
	try {
		const response = await fetch("/api/home", {
			method: "GET",
			credentials: "include",
		});

		const result = await response.json();

		if (result.success) {
			return result.user;
		} else {
			console.error("Error fetching data:", result.message);
			return null;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}
