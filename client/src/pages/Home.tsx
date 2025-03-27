import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import StatusBar from "@/components/StatusBar";
import MessageForm from "@/components/MessageForm";
import LogSection from "@/components/LogSection";
import ErrorModal from "@/components/ErrorModal";
import { useWhatsApp } from "@/context/WhatsAppContext";

const Home = () => {
  const { theme } = useTheme();
  const { showErrorModal } = useWhatsApp();

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${theme}`}>
      <div className="container mx-auto px-4 py-8 max-w-screen-md">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-primary dark:text-white">
              WhatsApp Messaging Server
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Send WhatsApp messages without QR code scanning
          </p>
        </header>

        <StatusBar />

        <MessageForm />

        <LogSection />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>WhatsApp Messaging Server &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>

      {showErrorModal && <ErrorModal />}
    </div>
  );
};

export default Home;
