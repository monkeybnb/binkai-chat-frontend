import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AlignArrowLeft, Exit } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";
import { useState } from "react";
import { useDisconnect } from "wagmi";

interface Network {
  name: string;
  icon: string;
}

const icon =
  "https://s3-alpha-sig.figma.com/img/b092/31a9/0c06efc55ecafd0466d11cb0b941c09a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=UVYdwK5FB3-Fg1bf2zxgZeOfeQGWyyAMhX4SiYtxUn-QvqNkwGUEeuKk8knLii0Pw54PNUmzYshpdQhgLqtKBTyfEGMRNOGZ3hzG1TZZ1tBaXYmuEA3P6m9o7hym18PAwJGH4bEX2trF-pmHtyerLM547uW7xbnEsLfro45SD-N9UDO2fsE4t7nKN9-lhsOoeZplWntGfPQxPGsj92qzQqWMOuPRR-1rF-xsC7FYmYhaDH9DcMUkRU4lMbqOhzAy2i9qv1NzYXVfcrE6agwfwOC07U7XXrzfZe29LFeoI8939VbAyoni0eV1NFZhK1p38jryLZgES5sqxILUpbWYZA__";

const supportedNetworks: Network[] = [
  { name: "Base", icon },
  { name: "Polygon", icon },
  { name: "BSC", icon },
  { name: "TronNRG", icon },
];

const connectedNetworks: Network[] = [
  { name: "Solana", icon },
  { name: "Near", icon },
  { name: "Polkadot", icon },
  { name: "Ethereum", icon },
  { name: "Monad", icon },
  { name: "Avalanche", icon },
];

const NetworkItem = ({
  network,
  isConnected = false,
}: {
  network: Network;
  isConnected?: boolean;
}) => (
  <div className="flex items-center justify-between py-2 pl-3 pr-2 border rounded-xl gap-3">
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 relative rounded-full overflow-hidden">
        <Image
          src={network.icon}
          alt={network.name}
          fill
          className="object-contain"
        />
      </div>
      <span className="text-label-small">{network.name}</span>
    </div>
    {isConnected ? (
      <Button variant="secondary" size="icon" className="h-9 w-9">
        <Exit />
      </Button>
    ) : (
      <Button variant="default" size="sm" className="rounded-lg">
        Connect
      </Button>
    )}
  </div>
);

const RightSidebar = ({
  isOpenRightSider,
  setIsOpenRightSider,
}: {
  isOpenRightSider: boolean;
  setIsOpenRightSider: (isOpenRightSider: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const { disconnect } = useDisconnect();
  return (
    <div
      className={cn(
        "flex flex-col w-[300px] h-screen overflow-hidden border-l transition-all duration-300",
        {
          "w-[0px]": !isOpenRightSider,
        }
      )}
    >
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-label-large whitespace-nowrap">
            Network Connect
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpenRightSider(!isOpenRightSider)}
            className="w-11 h-11"
          >
            <AlignArrowLeft className="rotate-180" />
          </Button>{" "}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="px-3 text-label-small text-muted-foreground">
            Supported Network
          </h3>
          {supportedNetworks.map((network) => (
            <NetworkItem key={network.name} network={network} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="px-3 text-label-small text-muted-foreground">
            Connected
          </h3>
          {connectedNetworks.map((network) => (
            <NetworkItem key={network.name} network={network} isConnected />
          ))}
        </div>
      </div>
      <div className="p-4">
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          Disconnect All
        </Button>
      </div>
      <ConfirmDialog
        danger
        title="Disconnect All"
        description="Would you like to disconnect all networks?"
        onConfirm={() => {
          logout();
          disconnect();
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        confirmText="Disconnect"
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default RightSidebar;
