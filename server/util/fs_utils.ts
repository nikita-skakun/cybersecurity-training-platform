export async function getJson(filePath: string) {
	return JSON.parse(await Deno.readTextFile(filePath));
}
