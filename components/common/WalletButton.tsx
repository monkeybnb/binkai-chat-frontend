import { ChevronRight } from "lucide-react";

interface WalletButtonProps {
  disabled?: boolean;
  iconUrl: string;
  connector: any;
  handleConnect: () => void;
  isConnecting?: boolean;
}

const WalletButton = ({
  disabled = false,
  iconUrl,
  connector,
  handleConnect,
  isConnecting = false,
}: WalletButtonProps) => {
  return (
    <button
      className={`w-full h-[72px] mobile:h-auto bg-muted hover:bg-brand-50 flex items-center rounded-xl justify-between mobile:pl-3 mobile:pr-2 mobile:py-3 pl-5 pr-4 py-4 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={handleConnect}
      disabled={disabled}
    >
      <div className="flex items-center gap-4 flex-1">
        {iconUrl && (
          <img
            src={iconUrl}
            alt={connector.name}
            className="w-10 h-10 mobile:w-8 mobile:h-8 rounded-full aspect-square"
          />
        )}
        <span className="text-label-medium">
          {isConnecting ? "Connecting..." : connector.name}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
};

export default WalletButton;
