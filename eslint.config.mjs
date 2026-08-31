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
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Monorepo siblings / vendored skills — not part of the Next.js app surface.
    ".claude/**",
    ".superpowers/**",
    "mobile/**",
    "old-versions-valuable-files/**",
    "pre-plans/**",
    "docs/apex-old-version-valuable-files/**",
  ]),
]);

export default eslintConfig;
