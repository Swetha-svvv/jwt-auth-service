import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import { pool } from "../db";
import rateLimit from "express-rate-limit";

const { v4: uuidv4 } = require("uuid");
const router = Router();

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);

// 🔐 Generate Access Token
const generateAccessToken = (username: string) => {
  return jwt.sign(
    {
      iss: "jwt-auth-service",
      sub: username,
      roles: ["user"]
    },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "15m"
    }
  );
};

// ✅ REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Weak password" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(username,email,password_hash) VALUES($1,$2,$3) RETURNING id,username",
      [username, email, hash]
    );

    return res.status(201).json({
      id: result.rows[0].id,
      username,
      message: "User registered successfully"
    });
  } catch {
    return res.status(409).json({ error: "User already exists" });
  }
});
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

// ✅ LOGIN
router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (!user.rows.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(
    password,
    user.rows[0].password_hash
  );

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(username);
  const refreshToken = uuidv4();

  await pool.query(
    "INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",
    [user.rows[0].id, refreshToken]
  );

  return res.json({
    token_type: "Bearer",
    access_token: accessToken,
    expires_in: 900,
    refresh_token: refreshToken
  });
});

// ✅ REFRESH TOKEN
router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  const token = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token=$1",
    [refresh_token]
  );

  if (!token.rows.length) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const user = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [token.rows[0].user_id]
  );

  const newAccessToken = generateAccessToken(user.rows[0].username);

  return res.json({
    token_type: "Bearer",
    access_token: newAccessToken,
    expires_in: 900
  });
});

// ✅ LOGOUT
router.post("/logout", async (req, res) => {
  const { refresh_token } = req.body;

  await pool.query(
    "DELETE FROM refresh_tokens WHERE token=$1",
    [refresh_token]
  );

  return res.status(204).send();
});

export default router;