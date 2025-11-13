import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const user = await clerkClient.users.getUser(userId);

    const role = user?.privateMetadata?.role;

    if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
};
