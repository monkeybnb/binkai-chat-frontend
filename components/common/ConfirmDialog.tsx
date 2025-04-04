import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";

const ConfirmDialog = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  open,
  setOpen,
  danger = false,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  danger?: boolean;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" p-0 gap-0 max-w-[432px]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center font-medium">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-6">
          <div className="text-center">{description}</div>
          <div className="flex gap-4 items-center">
            <Button
              className="w-full"
              variant="secondary"
              onClick={onCancel}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              variant={danger ? "destructive" : "default"}
              onClick={onConfirm}
              size="lg"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
