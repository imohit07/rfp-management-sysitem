import { pollInboxForRfpReplies } from "./receiver";

export class EmailPollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private pollingIntervalMs: number;

  constructor(intervalMinutes: number = 2) {
    this.pollingIntervalMs = intervalMinutes * 60 * 1000;
  }

  start(): void {
    if (this.isRunning) {
      console.log("Email polling service is already running");
      return;
    }

    console.log(`Starting email polling service (checking every ${this.pollingIntervalMs / 60000} minutes)`);
    this.isRunning = true;

    // Run immediately on start
    this.poll();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollingIntervalMs);
  }

  stop(): void {
    if (!this.isRunning) {
      console.log("Email polling service is not running");
      return;
    }

    console.log("Stopping email polling service");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async poll(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Polling inbox for RFP replies...`);
      const result = await pollInboxForRfpReplies();
      console.log(`[${new Date().toISOString()}] Polling complete. Processed ${result.processed} message(s)`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error during email polling:`, error);
      // Don't throw - we want the service to continue running
    }
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
let pollingServiceInstance: EmailPollingService | null = null;

export function getPollingService(): EmailPollingService {
  if (!pollingServiceInstance) {
    pollingServiceInstance = new EmailPollingService(2); // Check every 2 minutes
  }
  return pollingServiceInstance;
}
