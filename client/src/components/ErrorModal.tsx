import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWhatsApp } from "@/context/WhatsAppContext";

const ErrorModal = () => {
  const { errorMessage, hideErrorModal } = useWhatsApp();

  return (
    <AlertDialog open={true} onOpenChange={hideErrorModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">Error</AlertDialogTitle>
          <AlertDialogDescription>
            {errorMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorModal;
