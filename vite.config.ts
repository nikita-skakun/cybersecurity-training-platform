import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import deno from "@deno/vite-plugin";

import "react";
import "react-dom";

export default defineConfig({
	root: "./client",
	server: {
		port: 3000,
		host: true,
		allowedHosts: ["echo-shield.com"],
		proxy: {
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	plugins: [react(), deno()],
	optimizeDeps: {
		include: ["react/jsx-runtime"],
	},
});
