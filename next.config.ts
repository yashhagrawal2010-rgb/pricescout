import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets Replit's preview/webview iframe (served from a *.replit.dev or
  // *.repl.co proxy origin) request the dev server without Next's
  // cross-origin dev-request protection blocking it.
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.picard.replit.dev"],
};

export default nextConfig;
