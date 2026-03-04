import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import fs from "fs";
import { pool } from "../db";

const router = Router();

const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string);

// ✅ PROFILE (Protected)
router.get("/profile", verifyToken, async (req, res) => {
  const userData = (req as any).user;

  const user = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [userData.sub]
  );

  return res.json({
    id: user.rows[0].id,
    username: user.rows[0].username,
    email: user.rows[0].email,
    roles: ["user"]
  });
});

// ✅ VERIFY TOKEN
router.get("/verify-token", (req, res) => {
  const token = req.query.token as string;

  try {
    const decoded = jwt.verify(token, publicKey);
    return res.json({
      valid: true,
      claims: decoded
    });
  } catch (err: any) {
    return res.json({
      valid: false,
      reason: err.message
    });
  }
});

export default router;