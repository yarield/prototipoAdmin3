import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Data fetching with useEffect + setState is standard pattern in this project
      "react-hooks/set-state-in-effect": "warn",
      // Using <img> is acceptable for external URLs (backend uploads)
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
