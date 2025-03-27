import { Boom } from '@hapi/boom';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  isJidGroup
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let sock: any = null;
let connectionStatus: 'connected' | 'disconnected' = 'disconnected';

// Create a temporary directory for auth files
const AUTH_FOLDER = path.join(os.tmpdir(), 'whatsapp-auth-' + Date.now());
if (!fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Initialize WhatsApp with pre-existing credentials
export const initializeWhatsApp = async (credsJson: string) => {
  try {
    // Write the provided creds.json to the auth folder
    fs.writeFileSync(path.join(AUTH_FOLDER, 'creds.json'), credsJson);

    // Set up auth state
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    // Create socket connection
    sock = makeWASocket({
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        // @ts-ignore - Type error in baileys library
        keys: makeCacheableSignalKeyStore(state.keys, console),
      },
      browser: ['WhatsApp Messaging Server', 'Chrome', '10.0'],
    });

    // Handle connection updates
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect);
        connectionStatus = 'disconnected';

        // Reconnect if not logged out
        if (shouldReconnect) {
          await initializeWhatsApp(credsJson);
        }
      } else if (connection === 'open') {
        console.log('Connection opened');
        connectionStatus = 'connected';
      }
    });

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);

    return sock;
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    connectionStatus = 'disconnected';
    throw error;
  }
};

// Send a WhatsApp message to multiple recipients
export const sendWhatsAppMessage = async (
  userPhone: string,
  messageContent: string,
  targetType: string = 'individual',
  targetPhones: string = '',
  messageDelay: number = 1000,
  enableRetry: boolean = false,
  maxRetries: number = 3
) => {
  if (!sock) {
    throw new Error('WhatsApp connection not initialized');
  }

  try {
    // Split targetPhones into an array of phone numbers/group IDs
    const targets = targetPhones.trim() 
      ? targetPhones.split('\n').filter(target => target.trim() !== '')
      : [userPhone]; // If no targets specified, use the user's own phone
    
    // For message with multiple lines, send each line with delay
    const messageLines = messageContent.split('\n').filter(line => line.trim() !== '');
    
    // Send to each target
    for (const target of targets) {
      const jid = formatPhoneNumber(target, targetType);
      console.log(`Sending messages to target: ${jid}`);
      
      for (const line of messageLines) {
        if (line.trim() === '') continue;
        
        let sent = false;
        let attempts = 0;
        
        while (!sent && (attempts <= maxRetries || !enableRetry)) {
          try {
            await sock.sendMessage(jid, { text: line });
            sent = true;
            console.log(`Message sent to ${jid}: ${line.substring(0, 30)}...`);
          } catch (error) {
            attempts++;
            console.error(`Error sending message (attempt ${attempts}):`, error);
            
            if (!enableRetry || attempts > maxRetries) {
              throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Add delay between messages
        if (messageLines.length > 1) {
          await new Promise(resolve => setTimeout(resolve, messageDelay));
        }
      }
      
      // Add delay between targets
      if (targets.length > 1) {
        await new Promise(resolve => setTimeout(resolve, messageDelay * 2));
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Format phone number to WhatsApp JID format
const formatPhoneNumber = (phoneNumber: string, targetType: string): string => {
  // Remove any non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (targetType === 'group') {
    return `${cleanNumber}@g.us`;
  }
  
  return `${cleanNumber}@s.whatsapp.net`;
};

// Disconnect WhatsApp session
export const disconnectWhatsApp = async () => {
  if (sock) {
    await sock.logout();
    sock = null;
    connectionStatus = 'disconnected';
    
    // Clean up auth folder
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }
  }
};

// Get current WhatsApp connection status
export const getWhatsAppStatus = () => {
  return connectionStatus;
};
