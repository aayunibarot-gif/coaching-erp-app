import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import remarkRoutes from "./routes/remarkRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import path from "path";

const app = express();
await connectDB();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost",
        "capacitor://localhost",
        process.env.CLIENT_URL,
      ];

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(null, true); // Keeping open for ease of deployment, you can lock it down later
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  authRoutes
);

app.get("/", (req, res) => {
  res.json({ message: "Coaching ERP API is running." });
});

app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/remarks", remarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/materials", materialRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));