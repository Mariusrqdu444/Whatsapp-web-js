import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { 
  initializeWhatsApp, 
  disconnectWhatsApp,
  sendWhatsAppMessage,
  getWhatsAppStatus 
} from "./whatsapp";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Configure multer for file uploads
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WhatsApp session status check
  app.get("/api/whatsapp/status", async (req, res) => {
    try {
      const status = getWhatsAppStatus();
      res.json({ status, success: true });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get WhatsApp status" 
      });
    }
  });

  // Start WhatsApp session with creds.json
  app.post("/api/whatsapp/start", upload.fields([
    { name: 'creds', maxCount: 1 },
    { name: 'messageFile', maxCount: 1 }
  ]), async (req: Request, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.creds || !files.creds[0]) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing credentials file" 
        });
      }

      const credsFile = files.creds[0];
      let messageContent = "";

      // Get message content from either direct input or file
      if (req.body.messageText) {
        messageContent = req.body.messageText;
      } else if (files.messageFile && files.messageFile[0]) {
        const messageFilePath = files.messageFile[0].path;
        messageContent = fs.readFileSync(messageFilePath, 'utf8');
        // Clean up the temp file
        fs.unlinkSync(messageFilePath);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "Message content is required" 
        });
      }

      // Extract other form data
      const userPhone = req.body.userPhone;
      const targetType = req.body.targetType || "individual";
      const messageDelay = parseInt(req.body.messageDelay) || 1000;
      const enableRetry = req.body.enableRetry === "true";
      const maxRetries = parseInt(req.body.maxRetries) || 3;

      if (!userPhone) {
        return res.status(400).json({ 
          success: false, 
          error: "Phone number is required" 
        });
      }

      // Read the credentials file
      const credsData = fs.readFileSync(credsFile.path, 'utf8');
      
      // Clean up the temp file
      fs.unlinkSync(credsFile.path);

      try {
        // Validate JSON format
        JSON.parse(credsData);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid credentials JSON file" 
        });
      }

      // Initialize WhatsApp
      await initializeWhatsApp(credsData);

      // Extract target phones
      const targetPhones = req.body.targetPhones || '';

      // Start sending messages
      sendWhatsAppMessage(
        userPhone, 
        messageContent, 
        targetType,
        targetPhones,
        messageDelay,
        enableRetry,
        maxRetries
      );

      // Store the session in memory for tracking
      const sessionId = Date.now().toString();
      await storage.createSession({
        id: sessionId,
        userPhone,
        targetType,
        targetPhones,
        messageDelay,
        enableRetry,
        maxRetries,
        status: "active",
        createdAt: new Date()
      });

      res.json({ 
        success: true, 
        message: "WhatsApp messaging started successfully",
        sessionId
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to start WhatsApp session" 
      });
    }
  });

  // Stop WhatsApp session
  app.post("/api/whatsapp/stop", async (req, res) => {
    try {
      await disconnectWhatsApp();
      
      // Update any active sessions to inactive
      const activeSessions = await storage.getActiveSessions();
      for (const session of activeSessions) {
        await storage.updateSessionStatus(session.id, "stopped");
      }

      res.json({ 
        success: true, 
        message: "WhatsApp messaging stopped successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to stop WhatsApp session" 
      });
    }
  });

  return httpServer;
}
