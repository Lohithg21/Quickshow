import express from "express";
import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

// 🟢 Public access (no Clerk auth) — allows TMDB movies fetching even during local testing
// In production, you can re-enable protectAdmin if you want to restrict this to admins only
showRouter.get("/now-playing", getNowPlayingMovies);

// 🔒 Admin-only: adding new shows to database
showRouter.post("/add", protectAdmin, addShow);

// 🟢 Public: fetch all active shows
showRouter.get("/all", getShows);

// 🟢 Public: get show details by movie ID
showRouter.get("/:movieId", getShow);

export default showRouter;
