import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";

export function useUserData(logoutOnError = true): User | null {
	const [user, setUser] = useState<User | null>(() => {
		const cachedUser = localStorage.getItem("userData");
		return cachedUser ? JSON.parse(cachedUser) : null;
	});
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
				localStorage.setItem("userData", JSON.stringify(result.user));
				setUser(result.user);
			} catch (error) {
				console.error("Error fetching data:", error);
				localStorage.removeItem("userData");
				if (logoutOnError) navigate("/login");
			}
		})();
	}, [navigate]);

	return user;
}
