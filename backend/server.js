require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const visitorRoutes = require("./routes/visitorRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = Array.from(
  new Set([
    ...(process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  ])
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Employee Visitor Management API is running" });
});

app.get("/api/health", (req, res) => {
  const state = req.app.locals.dbConnected ? "connected" : "disconnected";
  res.json({ status: "OK", database: state });
});

app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from backend/.env");
    }

    await connectDB();
    app.locals.dbConnected = true;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Auth login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`Auth register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`Auth Google: POST http://localhost:${PORT}/api/auth/google`);
      console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("\nBackend startup failed:", error.message);
    console.error("Check backend/.env and MongoDB configuration.\n");
    process.exit(1);
  }
};

startServer();
