import { useUserData } from "../util/api_utils.ts";
import { TitleBar } from "../util/screen_utils.tsx";

export default function HomePage() {
	const user = useUserData();

	return (
		<div className="page-container">
			<TitleBar user={user} />
			<main className="fullsize-content">
				<h1>Welcome Home!</h1>
			</main>
		</div>
	);
}
