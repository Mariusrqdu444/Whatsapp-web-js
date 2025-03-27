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
      let credsData = "";
      
      // Check for environment variable CREDS_JSON first (for Render deployment)
      if (process.env.CREDS_JSON) {
        console.log("Using CREDS_JSON from environment variable");
        credsData = process.env.CREDS_JSON;
        // Log length of credentials data
        console.log(`Credentials data length: ${credsData.length}`);
        
        // Make sure it's properly parsed as JSON (some environment variables can get messed up)
        try {
          // If it's already a JSON string, this will work
          JSON.parse(credsData);
        } catch (e) {
          // If it's not valid JSON, it might be double-escaped or have other issues
          console.error("Error parsing CREDS_JSON from environment variable:", e);
          console.log("Attempting to fix JSON format issues...");
          
          // Try to clean up the string (remove extra quotes, etc.)
          if (credsData.startsWith('"') && credsData.endsWith('"')) {
            // Handle the case where JSON is wrapped in quotes and escaped
            credsData = JSON.parse(credsData);
          }
        }
      } 
      // Then check for creds.json file in the project directory
      else if (fs.existsSync(path.join(process.cwd(), 'creds.json'))) {
        console.log("Using creds.json from project directory");
        credsData = fs.readFileSync(path.join(process.cwd(), 'creds.json'), 'utf8');
      }
      // Finally, check for uploaded file
      else {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (!files || !files.creds || !files.creds[0]) {
          return res.status(400).json({ 
            success: false, 
            error: "Missing credentials file and no default credentials found" 
          });
        }

        const credsFile = files.creds[0];
        credsData = fs.readFileSync(credsFile.path, 'utf8');
        
        // Clean up the temp file
        fs.unlinkSync(credsFile.path);
      }

      // Check if credentials are valid JSON
      try {
        JSON.parse(credsData);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid credentials JSON format" 
        });
      }

      let messageContent = "";

      // Get message content from either direct input or file
      if (req.body.messageText) {
        messageContent = req.body.messageText;
      } else if (req.files && (req.files as any).messageFile && (req.files as any).messageFile[0]) {
        const messageFilePath = (req.files as any).messageFile[0].path;
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
