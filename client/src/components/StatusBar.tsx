import { useWhatsApp } from "@/context/WhatsAppContext";
import { Button } from "@/components/ui/button";

const StatusBar = () => {
  const { connectionState, isMessaging, startMessaging, stopMessaging } = useWhatsApp();

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-400";
      case "disconnected":
      default:
        return "bg-gray-400";
    }
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`} />
          <span className="text-gray-700 dark:text-gray-300">{getStatusMessage()}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="default"
            onClick={startMessaging}
            disabled={isMessaging}
          >
            Start Messaging
          </Button>
          <Button 
            variant="secondary"
            onClick={stopMessaging}
            disabled={!isMessaging}
          >
            Stop Messaging
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
