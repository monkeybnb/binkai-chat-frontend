import { cn } from "@/lib/utils";

interface BlurMaskOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlurMaskOverlay = ({ isOpen, onClose }: BlurMaskOverlayProps) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className={cn(
        "fixed inset-0 z-50 bg-white/50 backdrop-blur-[2px] transition-all duration-300",
        {
          "opacity-100 pointer-events-auto": isOpen,
          "opacity-0 pointer-events-none": !isOpen,
        }
      )}
    />
  );
};
