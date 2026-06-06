import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The base path matters when Bashir deploys to CloudFront.
  // If the app is served from a subfolder, Bashir will update this.
  // TODO (Bashir): Set base to your CloudFront distribution path if needed
  base: "/",
});
