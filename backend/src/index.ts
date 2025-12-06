import "express-async-errors";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { rfpsRouter } from "./routes/rfps";
import { vendorsRouter } from "./routes/vendors";
import { emailRouter } from "./routes/email";
import { getPollingService } from "./email/pollingService";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/rfps", rfpsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/email", emailRouter);

// basic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error("Error:", err);
    // eslint-disable-next-line no-console
    console.error("Stack:", err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({ 
      error: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  }
);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.PORT}`);
  
  // Start automatic email polling service
  try {
    const pollingService = getPollingService();
    pollingService.start();
    // eslint-disable-next-line no-console
    console.log("Email polling service started automatically");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start email polling service:", error);
    // eslint-disable-next-line no-console
    console.log("You can start it manually via POST /api/email/polling/start");
  }
});


