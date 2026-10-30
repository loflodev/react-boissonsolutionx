import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Two projects: the React app in jsdom, and the build scripts in plain Node
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "web",
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/test/setup.ts"],
          },
        },
        {
          test: {
            name: "scripts",
            environment: "node",
            include: ["scripts/**/*.test.mjs"],
          },
        },
      ],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs"],
        exclude: [
          "**/*.test.*",
          "src/test/**",
          "src/main.tsx",
          "src/vite-env.d.ts",
          "scripts/prerender.mjs",
        ],
        reporter: ["text-summary", "lcov"],
      },
    },
  })
);
