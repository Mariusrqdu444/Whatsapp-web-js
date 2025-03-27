import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { startSession, stopSession, checkStatus } from "@/lib/api";

type ConnectionState = "connected" | "connecting" | "disconnected";

type LogEntry = {
  message: string;
  type: "info" | "success" | "error" | "warning";
  timestamp: Date;
};

type WhatsAppFormData = {
  userPhone: string;
  targetType: string;
  targetPhones: string; // New field for multiple targets
  messageInputType: string;
  messageText: string;
  messageDelay: number;
  enableRetry: boolean;
  maxRetries: number;
};

interface WhatsAppContextType {
  connectionState: ConnectionState;
  isMessaging: boolean;
  logs: LogEntry[];
  credsFile: File | null;
  messageFile: File | null;
  errorMessage: string;
  showErrorModal: boolean;
  formData: WhatsAppFormData;
  setCredsFile: (file: File | null) => void;
  setMessageFile: (file: File | null) => void;
  startMessaging: () => void;
  stopMessaging: () => void;
  addLog: (message: string, type?: "info" | "success" | "error" | "warning") => void;
  clearLogs: () => void;
  showError: (message: string) => void;
  hideErrorModal: () => void;
  setFormData: (data: WhatsAppFormData) => void;
}

const defaultFormData: WhatsAppFormData = {
  userPhone: "",
  targetType: "individual",
  targetPhones: "", // Initialize empty target phones
  messageInputType: "direct",
  messageText: "",
  messageDelay: 1000,
  enableRetry: false,
  maxRetries: 3,
};

const WhatsAppContext = createContext<WhatsAppContextType>({
  connectionState: "disconnected",
  isMessaging: false,
  logs: [],
  credsFile: null,
  messageFile: null,
  errorMessage: "",
  showErrorModal: false,
  formData: defaultFormData,
  setCredsFile: () => {},
  setMessageFile: () => {},
  startMessaging: () => {},
  stopMessaging: () => {},
  addLog: () => {},
  clearLogs: () => {},
  showError: () => {},
  hideErrorModal: () => {},
  setFormData: () => {},
});

export const useWhatsApp = () => useContext(WhatsAppContext);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isMessaging, setIsMessaging] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [credsFile, setCredsFile] = useState<File | null>(null);
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [formData, setFormData] = useState<WhatsAppFormData>(defaultFormData);

  // Initialize with a system log
  useEffect(() => {
    addLog("System initialized. Ready to connect.");
  }, []);

  // Poll for status when messaging is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isMessaging) {
      intervalId = setInterval(async () => {
        try {
          const response = await checkStatus();
          if (response.status === "disconnected") {
            setConnectionState("disconnected");
            setIsMessaging(false);
            addLog("Connection lost. Messaging stopped.", "warning");
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMessaging]);

  const addLog = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const timestamp = new Date();
    const formattedTime = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    
    setLogs((prev) => [
      ...prev,
      { message: `[${formattedTime}] ${message}`, type, timestamp },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Log cleared.");
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    addLog(message, "error");
  };

  const hideErrorModal = () => {
    setShowErrorModal(false);
  };

  const validateForm = () => {
    if (!credsFile) {
      showError("Credentials file is required.");
      return false;
    }

    if (!formData.userPhone) {
      showError("Phone number is required.");
      return false;
    }

    if (formData.messageInputType === "direct" && !formData.messageText) {
      showError("Message text is required.");
      return false;
    }

    if (formData.messageInputType === "file" && !messageFile) {
      showError("Message file is required.");
      return false;
    }

    return true;
  };

  const startMessaging = async () => {
    if (!validateForm()) return;
    
    try {
      setConnectionState("connecting");
      addLog("Initializing WhatsApp connection...");
      
      const formDataToSend = new FormData();
      formDataToSend.append("creds", credsFile!);
      
      if (formData.messageInputType === "file" && messageFile) {
        formDataToSend.append("messageFile", messageFile);
      } else {
        formDataToSend.append("messageText", formData.messageText);
      }
      
      formDataToSend.append("userPhone", formData.userPhone);
      formDataToSend.append("targetType", formData.targetType);
      formDataToSend.append("targetPhones", formData.targetPhones);
      formDataToSend.append("messageDelay", formData.messageDelay.toString());
      formDataToSend.append("enableRetry", formData.enableRetry.toString());
      formDataToSend.append("maxRetries", formData.maxRetries.toString());
      
      const response = await startSession(formDataToSend);
      
      if (response.success) {
        setConnectionState("connected");
        setIsMessaging(true);
        addLog("Connection established successfully.", "success");
        addLog("Starting message delivery...");
        toast({
          title: "Success",
          description: "WhatsApp messaging started successfully.",
        });
      } else {
        setConnectionState("disconnected");
        showError(response.error || "Failed to start messaging session.");
      }
    } catch (error: any) {
      setConnectionState("disconnected");
      showError(error.message || "An error occurred while starting the messaging session.");
    }
  };

  const stopMessaging = async () => {
    try {
      const response = await stopSession();
      
      if (response.success) {
        addLog("Messaging process stopped.", "warning");
        toast({
          title: "Messaging Stopped",
          description: "WhatsApp messaging has been stopped.",
        });
      } else {
        showError(response.error || "Failed to stop messaging session.");
      }
    } catch (error: any) {
      showError(error.message || "An error occurred while stopping the messaging session.");
    } finally {
      setConnectionState("disconnected");
      setIsMessaging(false);
    }
  };

  return (
    <WhatsAppContext.Provider
      value={{
        connectionState,
        isMessaging,
        logs,
        credsFile,
        messageFile,
        errorMessage,
        showErrorModal,
        formData,
        setCredsFile,
        setMessageFile,
        startMessaging,
        stopMessaging,
        addLog,
        clearLogs,
        showError,
        hideErrorModal,
        setFormData,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};
