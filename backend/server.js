import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import { toNodeHandler,fromNodeHeaders } from "better-auth/node";
import { auth } from "./utils/auth.js";
const app = express();
const PORT = process.env.PORT || 4000;

// connect to DB
connectDB();
app.use(
  cors({
    origin: "http://localhost:5173", // change if frontend runs elsewhere
    credentials: true,
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});
// Example protected route
app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  return res.json(session);
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));