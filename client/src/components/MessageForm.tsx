import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWhatsApp } from "@/context/WhatsAppContext";
import { useToast } from "@/hooks/use-toast";

const MessageForm = () => {
  const { toast } = useToast();
  const { 
    setCredsFile, 
    setMessageFile, 
    credsFile,
    messageFile,
    isMessaging,
    formData,
    setFormData
  } = useWhatsApp();
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCredsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/json" && !file.name.endsWith('.json')) {
        toast({
          title: "Invalid file format",
          description: "Please upload a valid JSON file",
          variant: "destructive"
        });
        return;
      }
      setCredsFile(file);
    }
  };

  const handleMessageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
        toast({
          title: "Invalid file format",
          description: "Please upload a valid text file",
          variant: "destructive"
        });
        return;
      }
      setMessageFile(file);
    }
  };

  const clearCredsFile = () => {
    setCredsFile(null);
  };

  const clearMessageFile = () => {
    setMessageFile(null);
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const handleMessageInputTypeChange = (value: string) => {
    setFormData({
      ...formData,
      messageInputType: value
    });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-heading font-medium text-gray-800 dark:text-white">Configure Messaging</h2>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-medium text-primary dark:text-blue-400">Authentication</h3>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Upload creds.json file</Label>
            <div className="mt-1 flex items-center">
              <div className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
                <span>{credsFile ? credsFile.name : "No file chosen"}</span>
                <Input 
                  id="credsFileInput" 
                  type="file" 
                  accept=".json" 
                  className="hidden"
                  onChange={handleCredsFileChange}
                  disabled={isMessaging}
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("credsFileInput")?.click()}
                  disabled={isMessaging}
                >
                  Choose file
                </Button>
              </div>
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="ml-2"
                onClick={clearCredsFile}
                disabled={!credsFile || isMessaging}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload your WhatsApp credentials file to authenticate without QR code
            </p>
          </div>
        </div>
        
        {/* User Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-medium text-primary dark:text-blue-400">User Information</h3>
          
          <div>
            <Label htmlFor="userPhone">Your Phone Number with Country Code</Label>
            <Input 
              type="text" 
              id="userPhone" 
              name="userPhone" 
              placeholder="Example: 401234567890" 
              className="mt-1"
              value={formData.userPhone}
              onChange={(e) => setFormData({...formData, userPhone: e.target.value})}
              disabled={isMessaging}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter your WhatsApp phone number with country code (no + or spaces)
            </p>
          </div>

          <div>
            <Label htmlFor="targetType">Target Type</Label>
            <Select 
              defaultValue={formData.targetType} 
              onValueChange={(value) => setFormData({...formData, targetType: value})}
              disabled={isMessaging}
            >
              <SelectTrigger id="targetType" className="w-full">
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Contact</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetPhones">Target Phone Numbers/Group IDs</Label>
            <Textarea 
              id="targetPhones"
              name="targetPhones"
              rows={2}
              placeholder={formData.targetType === 'group' ? 
                "Enter group IDs (one per line)" : 
                "Enter phone numbers with country code (one per line)"}
              className="mt-1"
              value={formData.targetPhones}
              onChange={(e) => setFormData({...formData, targetPhones: e.target.value})}
              disabled={isMessaging}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.targetType === 'group' ? 
                "Enter group IDs, one per line (e.g., '120363029584952977@g.us')" : 
                "Enter phone numbers with country code, one per line (e.g., '401234567890')"}
            </p>
          </div>
        </div>
        
        {/* Message Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-medium text-primary dark:text-blue-400">Message Details</h3>
          
          <div className="space-y-2">
            <Label>Message Input Method</Label>
            <RadioGroup 
              defaultValue={formData.messageInputType} 
              onValueChange={handleMessageInputTypeChange}
              className="flex space-x-4"
              disabled={isMessaging}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct">Direct Input</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file">File Upload</Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.messageInputType === 'direct' ? (
            <div>
              <Label htmlFor="messageText">Message Text</Label>
              <Textarea 
                id="messageText"
                name="messageText"
                rows={3}
                placeholder="Enter your message here"
                className="mt-1"
                value={formData.messageText}
                onChange={(e) => setFormData({...formData, messageText: e.target.value})}
                disabled={isMessaging}
              />
            </div>
          ) : (
            <div>
              <Label className="block text-sm font-medium mb-1">Upload message file</Label>
              <div className="mt-1 flex items-center">
                <div className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
                  <span>{messageFile ? messageFile.name : "No file chosen"}</span>
                  <Input 
                    id="messageFileInput" 
                    type="file" 
                    accept=".txt" 
                    className="hidden"
                    onChange={handleMessageFileChange}
                    disabled={isMessaging}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("messageFileInput")?.click()}
                    disabled={isMessaging}
                  >
                    Choose file
                  </Button>
                </div>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="ml-2"
                  onClick={clearMessageFile}
                  disabled={!messageFile || isMessaging}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload a .txt file containing your message
              </p>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div>
          <div className="flex items-center mb-4">
            <Button 
              type="button" 
              variant="ghost"
              className="text-primary dark:text-blue-400 text-sm font-medium flex items-center p-0"
              onClick={toggleAdvanced}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d={showAdvanced 
                    ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" 
                    : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  } 
                  clipRule="evenodd" 
                />
              </svg>
              Advanced Options
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="messageDelay">Delay Between Messages (ms)</Label>
                <Input 
                  type="number" 
                  id="messageDelay" 
                  name="messageDelay" 
                  value={formData.messageDelay}
                  min="500"
                  className="mt-1"
                  onChange={(e) => setFormData({...formData, messageDelay: parseInt(e.target.value) || 1000})}
                  disabled={isMessaging}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Minimum recommended: 500ms to avoid being blocked
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableRetry" 
                  checked={formData.enableRetry}
                  onCheckedChange={(checked) => setFormData({...formData, enableRetry: checked})}
                  disabled={isMessaging}
                />
                <Label htmlFor="enableRetry">Auto-retry failed messages</Label>
              </div>
              
              <div>
                <Label htmlFor="maxRetries">Maximum Retry Attempts</Label>
                <Input 
                  type="number" 
                  id="maxRetries" 
                  name="maxRetries" 
                  value={formData.maxRetries}
                  min="1"
                  max="5"
                  className="mt-1"
                  onChange={(e) => setFormData({...formData, maxRetries: parseInt(e.target.value) || 3})}
                  disabled={isMessaging || !formData.enableRetry}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
