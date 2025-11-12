import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ✅ Connect to MongoDB
await connectDB();

// ✅ Define __dirname properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware setup (order matters)
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://quickshow-4psp.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Clerk Middleware (auth before routes)
app.use(clerkMiddleware());

// ✅ Stripe Webhook route (must come *before* bodyParser)
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ✅ API routes
app.get("/", (req, res) => res.send("🎬 QuickShow backend is live!"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ✅ Serve frontend in production safely
if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  // ⚠️ Use only "/*" — not "https://" or malformed URLs
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ✅ Fallback port for Render
const port = process.env.PORT || 3000;

// ✅ Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
});
