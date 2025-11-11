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

await connectDB();

app.use(clerkMiddleware());
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);
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

// API Routes
app.get("/", (req, res) => res.send("QuickShow backend is live!"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ✅ Fix static file serving for production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  // IMPORTANT: use a valid wildcard route pattern
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`✅ Server running on port ${port}`)
);
