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

// ✅ Proper __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Stripe webhook (raw body) comes FIRST
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ✅ Then JSON + CORS + Clerk
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quickshow-4psp.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(clerkMiddleware());

// ✅ API Routes
app.get("/", (req, res) => res.send("🎬 QuickShow backend is live!"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  // Wildcard route for SPA
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ✅ Render-compatible port binding
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${port}`)
);
