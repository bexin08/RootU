import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import onboardingRoutes from "./routes/onboarding";
import chatRoutes from "./routes/chat";
import dashboardRoutes from "./routes/dashboard";
import scheduleRoutes from "./routes/schedule";
import localRoutes from "./routes/local";
import preferencesRoutes from "./routes/preferences";
import internalRoutes from "./routes/internal";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/onboarding", onboardingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/local", localRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/internal", internalRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
