import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { useToast } from "@/common/components/ui/use-toast";
import { parseError } from "@/common/utils/error";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteDocument } from "../services/hooks";

interface DeleteConfirmationDialogProps {
  trigger: React.ReactNode;
  documentIds: string[];
  onSuccess?: () => void;
}

const DeleteConfirmationDialog = ({ trigger, documentIds, onSuccess }: DeleteConfirmationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { mutate: deleteDocument, isPending: isDeleting, error } = useDeleteDocument();

  const itemCount = documentIds.length;
  const defaultTitle = itemCount > 1 ? `Delete documents?` : "Delete document?";
  const defaultDescription =
    itemCount > 1
      ? `Are you sure you want to delete these documents? This action cannot be undone.`
      : "Are you sure you want to delete this document? This action cannot be undone.";

  const handleDelete = async () => {
    if (documentIds.length === 0) return;

    deleteDocument(documentIds, {
      onSuccess: () => {
        onSuccess?.();
        setIsOpen(false);
        toast({
          title: itemCount > 1 ? "Documents deleted" : "Document deleted",
          description:
            itemCount > 1
              ? `${itemCount} documents have been successfully deleted.`
              : "The document has been successfully deleted.",
        });
      },
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {defaultTitle}
          </DialogTitle>
          <DialogDescription>
            {error ? <span className="text-destructive">{parseError(error)}</span> : defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={documentIds.length === 0 || isDeleting}>
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
