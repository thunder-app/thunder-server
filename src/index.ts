import express from "express";
import dotenv from "dotenv";

// Types
import { Request, Response } from "express";
import { NotificationRequest, DeleteNotificationRequest } from "./types/notification_request";

// Database
import sequelize from "./database/database";

// Models
import AccountNotification from "./database/models/account_notification";

// Notification service
import { addAccountNotification, deleteAccountNotification, generateTestNotification } from "./notifications/notifications";
import { notificationService, checkNotifications } from "./notifications/service/notification_service";

dotenv.config({ quiet: true });

const DEBUG_MODE = process.env.DEBUG_MODE === "true"; // When true, the server will drop all tables on startup

const app = express();
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 2831;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Thunder server is running" });
});

app.post("/notifications", async (req: Request, res: Response) => {
  const { type, token, jwt, instance } = req.body as NotificationRequest;
  if (!type || !token || !jwt || !instance) return res.status(400).send("Missing one or more required parameters");

  try {
    const results = [];

    let notification = await addAccountNotification(type, token, jwt, instance);
    if (notification) results.push(notification.toJSON());

    res.status(201).json(results);
  } catch (error) {
    console.error("Error creating account notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/notifications", async (req, res) => {
  const { jwts } = req.body as DeleteNotificationRequest;
  if (!jwts) return res.status(400).send("Missing one or more required parameters");

  try {
    for (const jwt of jwts) await deleteAccountNotification(jwt);

    res.status(200).json({ message: "Account notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting account notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/test", async (req: Request, res: Response) => {
  const { jwt } = req.body as NotificationRequest;
  if (!jwt) return res.status(400).send("Missing one or more required parameters");

  try {
    let notification = await AccountNotification.findOne({ where: { jwt } });
    if (!notification) return res.status(404).send("Unable to send test notification - no record was found for the current account");

    let result = await generateTestNotification(jwt);

    res.status(201).json(result);

    // Do a check right away
    checkNotifications();
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server and connect to the database
app.listen(port, async () => {
  console.log(`Thunder server is running on http://localhost:${port}`);

  await sequelize.sync({ force: DEBUG_MODE });
  console.log("All models were synchronized successfully.");
});

// Start the notification service
notificationService.start();