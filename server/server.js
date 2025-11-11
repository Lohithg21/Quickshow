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

// ✅ Use environment variable for Render port (Render sets PORT automatically)
const port = process.env.PORT || 3000;

// ✅ Connect to MongoDB
await connectDB();

// ✅ Clerk middleware must come before routes
app.use(clerkMiddleware());

// ✅ Stripe Webhooks (must come before express.json to handle raw body)
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ✅ JSON & CORS middlewares
app.use(express.json());

// Explicitly allow your frontend URLs
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://quickshow-4psp.onrender.com", // Render frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Base route
app.get("/", (req, res) => res.send("QuickShow backend is live!"));

// ✅ API Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ✅ Serve React build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  // Fallback: if no API route matches, send React index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ✅ Start server
app.listen(port, () =>
  console.log(`✅ Server listening at http://localhost:${port}`)
);
