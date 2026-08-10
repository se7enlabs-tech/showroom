import app from "../app";

// Enable response streaming so /api/chat tokens reach the client incrementally
// instead of being buffered until the function finishes.
export const config = {
  api: {
    responseStreaming: true,
  },
};

// Vercel Node.js serverless entrypoint for the Express app.
export default function handler(req: any, res: any) {
  return app(req, res);
}