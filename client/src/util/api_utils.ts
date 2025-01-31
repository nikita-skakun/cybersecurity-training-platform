import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";

export function useUserData() {
	const [user, setUser] = useState<User | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch("/api/userData", {
					method: "GET",
					credentials: "include",
				});
				const result = await response.json();
				if (!response.ok) throw new Error(result.message);
				setUser(result.user);
			} catch (error) {
				console.error("Error fetching data:", error);
				navigate("/login");
			}
		})();
	}, [navigate]);

	return user;
}
