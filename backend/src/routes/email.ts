import { Router } from "express";
import { pollInboxForRfpReplies } from "../email/receiver";
import { getPollingService } from "../email/pollingService";

export const emailRouter = Router();

// Manual poll endpoint
emailRouter.post("/poll", async (_req, res) => {
  try {
    const result = await pollInboxForRfpReplies();
    res.json(result);
  } catch (error) {
    console.error("Error polling inbox:", error);
    res.status(500).json({ error: `Failed to poll inbox: ${error instanceof Error ? error.message : "Unknown error"}` });
  }
});

// Start automatic polling
emailRouter.post("/polling/start", (_req, res) => {
  try {
    const service = getPollingService();
    service.start();
    res.json({ status: "started", message: "Email polling service started" });
  } catch (error) {
    console.error("Error starting polling service:", error);
    res.status(500).json({ error: `Failed to start polling service: ${error instanceof Error ? error.message : "Unknown error"}` });
  }
});

// Stop automatic polling
emailRouter.post("/polling/stop", (_req, res) => {
  try {
    const service = getPollingService();
    service.stop();
    res.json({ status: "stopped", message: "Email polling service stopped" });
  } catch (error) {
    console.error("Error stopping polling service:", error);
    res.status(500).json({ error: `Failed to stop polling service: ${error instanceof Error ? error.message : "Unknown error"}` });
  }
});

// Get polling service status
emailRouter.get("/polling/status", (_req, res) => {
  try {
    const service = getPollingService();
    res.json({ 
      isRunning: service.isServiceRunning(),
      message: service.isServiceRunning() ? "Polling service is running" : "Polling service is stopped"
    });
  } catch (error) {
    console.error("Error getting polling service status:", error);
    res.status(500).json({ error: `Failed to get polling service status: ${error instanceof Error ? error.message : "Unknown error"}` });
  }
});


