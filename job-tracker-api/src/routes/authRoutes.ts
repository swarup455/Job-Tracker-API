import { Router } from "express";
import { registerUser, loginUser, getUser, updateUser, resetPassword, logoutUser, deleteAccount } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { 
    registerValidator,
    loginValidator,
    resetPasswordValidator,
    updateUserValidator,
    deleteAccountValidator
 } from "../validators/authValidator";

const router = Router();

router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginValidator, validate, loginUser);

router.get("/me", protect, getUser);
router.put("/update", protect, updateUserValidator, validate, updateUser);
router.put("/reset-password", protect, resetPasswordValidator, validate, resetPassword);
router.post("/logout", protect, logoutUser);
router.delete("/delete", protect, deleteAccountValidator, validate, deleteAccount);

export default router;