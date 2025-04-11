import { Exit } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const NetworkItem = ({
  chain,
  isConnected = false,
  switchChain,
  disconnect,
}: {
  chain: any;
  isConnected?: boolean;
  switchChain?: any;
  disconnect?: any;
}) => {
  return (
    <div className="flex items-center justify-between py-2 pl-3 pr-2 border rounded-xl gap-3">
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className="w-7 h-7 relative rounded-full overflow-hidden">
          <Image
            src={chain.icon}
            alt={chain.name}
            fill
            className="object-contain"
          />
        </div>
        <span className="text-label-small whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {chain.name}
        </span>
      </div>
      {isConnected ? (
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9"
          onClick={() => disconnect(chain)}
        >
          <Exit />
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="rounded-lg"
          onClick={() => switchChain(chain)}
        >
          Connect
        </Button>
      )}
    </div>
  );
};

export default NetworkItem;
