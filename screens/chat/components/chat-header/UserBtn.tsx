"use client";
import Image from "next/image";
import { useAccount } from "wagmi";

interface Network {
  name: string;
  icon: string;
}

const networks: Network[] = [
  {
    name: "Solana",
    icon: "https://s3-alpha-sig.figma.com/img/c73a/74a5/48f1cc53097d478d2daa459b38d1de0d?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=tTULwctSaqAgDM-nd4s4zQbMgMWGzWauevqSkNBDgdGaGPw8xyivpuJaZbNW4cIo~IBJq-k3wXJtfyQCZ6DpaM4ZNooCHnZowaQ1y331u-QQVSgCsKWaStKwKrD1z0imm2CkarSfIbyonhi6Z61RVaCFspxx4dPeksd4PYksbWjObSVBwpzmYfQkWNAvmUuBGeLfHTp-daulb1QEzC1yJBJdCOCmAivpsxMfsZxMCSCl2VyvOfNc38bJk6VU7zXtaUMEVwnwopLmE66nM3gn~bLcDnCL4TPA8TnlMgiLXoEx25suFntf800fQ9UUWKmR51qwMlvZpICvys1HOEMlGQ__",
  },
  {
    name: "Ethereum",
    icon: "https://s3-alpha-sig.figma.com/img/bcb4/a087/2f3e1cc0151dfb7670d47b4bbb3897a8?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DEfmAU6Vbz4XTkRIP7YKknMTJCJ1VBoCvcgrRe6slcJJqNnMzQaJKmnvBHPlmC4JKY62rCGlgmO~FnPaWpmw1xxkW0o9GaI0X1Ah8DNotwPVg~~U7y4DrpIln3wHODEw3A5x3nP5KSV53mB-yEorKrXwQwiDWJrpWtNUmiCQkxM8BHZ9zYj7gqpv-Szg~0N-TEoMGudW7wykdJE2-sM4cK-PbOf0nraOlBCj1jsRt2AOAMlyDf9AZ-JkvKfIXRQ~dS~2rFh5Gs9C23rjRlQ~MVaWgFTkAwlAIsvRk7LCJljeGYTR8I7m3EMSdXVCpcySt6AZPE7q1-K410tcr2AGnQ__",
  },
  {
    name: "BSC",
    icon: "https://s3-alpha-sig.figma.com/img/b092/31a9/0c06efc55ecafd0466d11cb0b941c09a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=UVYdwK5FB3-Fg1bf2zxgZeOfeQGWyyAMhX4SiYtxUn-QvqNkwGUEeuKk8knLii0Pw54PNUmzYshpdQhgLqtKBTyfEGMRNOGZ3hzG1TZZ1tBaXYmuEA3P6m9o7hym18PAwJGH4bEX2trF-pmHtyerLM547uW7xbnEsLfro45SD-N9UDO2fsE4t7nKN9-lhsOoeZplWntGfPQxPGsj92qzQqWMOuPRR-1rF-xsC7FYmYhaDH9DcMUkRU4lMbqOhzAy2i9qv1NzYXVfcrE6agwfwOC07U7XXrzfZe29LFeoI8939VbAyoni0eV1NFZhK1p38jryLZgES5sqxILUpbWYZA__",
  },
  {
    name: "Ethereum",
    icon: "https://s3-alpha-sig.figma.com/img/bcb4/a087/2f3e1cc0151dfb7670d47b4bbb3897a8?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DEfmAU6Vbz4XTkRIP7YKknMTJCJ1VBoCvcgrRe6slcJJqNnMzQaJKmnvBHPlmC4JKY62rCGlgmO~FnPaWpmw1xxkW0o9GaI0X1Ah8DNotwPVg~~U7y4DrpIln3wHODEw3A5x3nP5KSV53mB-yEorKrXwQwiDWJrpWtNUmiCQkxM8BHZ9zYj7gqpv-Szg~0N-TEoMGudW7wykdJE2-sM4cK-PbOf0nraOlBCj1jsRt2AOAMlyDf9AZ-JkvKfIXRQ~dS~2rFh5Gs9C23rjRlQ~MVaWgFTkAwlAIsvRk7LCJljeGYTR8I7m3EMSdXVCpcySt6AZPE7q1-K410tcr2AGnQ__",
  },
  {
    name: "BSC",
    icon: "https://s3-alpha-sig.figma.com/img/b092/31a9/0c06efc55ecafd0466d11cb0b941c09a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=UVYdwK5FB3-Fg1bf2zxgZeOfeQGWyyAMhX4SiYtxUn-QvqNkwGUEeuKk8knLii0Pw54PNUmzYshpdQhgLqtKBTyfEGMRNOGZ3hzG1TZZ1tBaXYmuEA3P6m9o7hym18PAwJGH4bEX2trF-pmHtyerLM547uW7xbnEsLfro45SD-N9UDO2fsE4t7nKN9-lhsOoeZplWntGfPQxPGsj92qzQqWMOuPRR-1rF-xsC7FYmYhaDH9DcMUkRU4lMbqOhzAy2i9qv1NzYXVfcrE6agwfwOC07U7XXrzfZe29LFeoI8939VbAyoni0eV1NFZhK1p38jryLZgES5sqxILUpbWYZA__",
  },
];

const NetworkList = () => {
  const { isConnected } = useAccount();

  const displayedNetworks = networks.slice(0, 3);
  const remainingCount = networks.length - displayedNetworks.length;

  return (
    <div className="flex -space-x-3 items-center px-1.5 py-1">
      {displayedNetworks.map((network, index) => (
        <div
          key={network.name}
          className="w-9 h-9 rounded-full overflow-hidden bg-background border-2 border-background relative"
          style={{ zIndex: networks.length - index }}
        >
          <Image
            src={network.icon}
            alt={network.name}
            fill
            className="object-contain w-9 h-9"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center border-2 text-xs font-medium relative"
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

const UserBtn = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="flex items-center cursor-pointer" onClick={onClick}>
      <NetworkList />
    </div>
  );
};

export default UserBtn;
