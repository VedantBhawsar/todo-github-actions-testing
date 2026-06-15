import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["**/__tests__/**/*.test.tsx"],
    coverage: {
      include: ["**/*.tsx"],
      exclude: ["e2e/**", "next.config.js"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
