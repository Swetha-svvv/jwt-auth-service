import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";

const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string);

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, publicKey);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "token_expired" });
  }
};