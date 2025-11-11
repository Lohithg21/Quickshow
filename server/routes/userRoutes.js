import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserBookings,
  updateFavorite,
  getFavorites,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/bookings", requireAuth(), getUserBookings);
router.post("/favorite", requireAuth(), updateFavorite);
router.get("/favorites", requireAuth(), getFavorites);

export default router;
