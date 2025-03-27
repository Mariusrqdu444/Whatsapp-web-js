import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWhatsApp } from "@/context/WhatsAppContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const LogSection = () => {
  const { logs, clearLogs } = useWhatsApp();

  return (
    <Card className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-heading font-medium text-gray-800 dark:text-white">Messaging Log</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={clearLogs}
        >
          Clear Log
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="bg-gray-100 dark:bg-gray-900 rounded p-3 h-40 font-mono text-sm text-gray-800 dark:text-gray-300">
          {logs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">System ready. Configure and start messaging.</div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-500' :
                  log.type === 'success' ? 'text-green-500' :
                  log.type === 'warning' ? 'text-yellow-500' :
                  'text-gray-700 dark:text-gray-300'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogSection;
