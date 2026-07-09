const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✅ FIX: explicitly allow your Expo web origin
app.use(cors({
  origin: [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:3000",
    "https://sahil-fit-app.vercel.app",
  ],
  credentials: true,
}));

app.use(express.json());

// rest of your routes...
app.get("/api", (req, res) => {
  res.json({ message: "AI Fitness Tracker API running 🚀" });
});

app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/workouts",  require("./routes/workoutRoutes"));
app.use("/api/nutrition", require("./routes/nutritionRoutes"));
app.use("/api/goals",     require("./routes/goalRoutes"));
app.use("/api/stats",     require("./routes/bodyStatsRoutes"));
app.use("/api/ai",        require("./routes/aiRoutes"));
app.use("/api/exercises", require("./routes/exerciseDBRoutes"));
app.use("/api/foods",     require("./routes/foodRoutes"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
// ✅ This allows connections from phone on same WiFi
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));