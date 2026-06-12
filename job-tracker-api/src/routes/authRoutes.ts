import { Router } from "express";
import { registerUser, loginUser, getUser, updateUser, resetPassword } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getUser);
router.put("/update", protect, updateUser);
router.put("/reset-password", protect, resetPassword);

export default router;