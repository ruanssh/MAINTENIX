import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function parseAllowedHosts(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const allowedHosts = parseAllowedHosts(env.VITE_ALLOWED_HOSTS);

  return {
    plugins: [react(), tailwindcss()],
    preview: allowedHosts.length ? { allowedHosts } : undefined,
  };
});
