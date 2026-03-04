import express from "express";
import dotenv from "dotenv";
import { initDB } from "./db/init";
import authRoutes from "./routes/auth";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
app.use(express.json());

// health
app.get("/health", (req, res) => res.send("OK"));

// auth routes
app.use("/auth", authRoutes);

app.use("/api", apiRoutes);

const PORT = process.env.API_PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on ${PORT}`);
  await initDB();
});