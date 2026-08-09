import app from "../app";

// Vercel Node.js serverless entrypoint for the Express app.
// Only the API routes defined in app.ts are handled here; Vercel serves
// the static `dist/` output and the SPA rewrite for non-API paths.
export default app;