import { REACT_TOKEN_ADDRESS, REACT_TOKEN_PRICE_USD } from "@/lib/config";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Coins,
  LayoutDashboard,
  PlusSquare,
  Rocket
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { sepolia } from "viem/chains";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";

const navItems = [
  { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
  { name: "Launchpad", href: "/projects", icon: Rocket },
  { name: "Markets", href: "/markets", icon: Coins },
];

export function Sidebar({ children }: { children: React.ReactNode; }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { openConnectModal } = useConnectModal();
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isConnected = !!address;
  const isWrongNetwork = isConnected && chain?.id !== sepolia.id;

  const { data: balanceData } = useBalance({
    address: address,
    token: REACT_TOKEN_ADDRESS as `0x${string}`,
  });

  const balance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const valueUsd = balance * REACT_TOKEN_PRICE_USD;

  return (
    <div className="flex h-screen bg-[#FFF9F0] text-black">
      <div className="flex flex-col w-72 h-full bg-white border-r-4 border-black overflow-y-auto">
        {/* Logo */}
        <div className="p-1 border-b-4 border-black bg-[#7DF9FF] flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dma1c8i6n/image/upload/v1764289640/reactpad_swlsov.png"
              alt="ReactPad Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Wallet Info */}
        {isConnected && (
          <div className="mx-6 my-3 p-4 border-4 border-black bg-[#2FFF2F] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-black border-2 border-black"></div>
                <span className="text-xs font-mono font-black uppercase">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <button className="hover:scale-110 transition-transform">
                <PlusSquare size={18} strokeWidth={3} />
              </button>
            </div>
            <div>
              <div className="text-3xl font-black">
                {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm font-black uppercase mt-1">REACT</div>
              <div className="text-xs font-bold mt-1">
                ~${valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            {isWrongNetwork ? (
              <button
                onClick={() => switchChain({ chainId: sepolia.id })}
                type="button"
                className="w-full mt-4 bg-yellow-500 text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all px-2 py-2"
              >
                WRONG NETWORK
              </button>
            ) : (
              <button
                onClick={() => disconnect()}
                type="button"
                className="w-full mt-4 bg-red-500 text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all px-2 py-2"
              >
                DISCONNECT
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 flex flex-col px-6 mt-6">
          <div>
            <ul className="space-y-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 transition-all font-black uppercase text-xs tracking-wider border-2 border-black ${isActive
                        ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                        : "text-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                        }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" strokeWidth={2.5} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Create Project Button - Highlighted */}
            <div className="mt-8 mb-3">
              <Link
                to="/dashboard/create"
                className={`flex items-center justify-center w-full px-4 py-4 transition-all font-black uppercase text-xs tracking-wider border-4 border-black ${pathname === "/dashboard/create"
                  ? "bg-[#FF4911] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                  : "bg-[#FF00F5] text-black hover:bg-[#FF4911] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  }`}
              >
                <PlusSquare className="w-5 h-5 mr-2" strokeWidth={3} />
                CREATE PROJECT
              </Link>
            </div>
          </div>

          {/* Connect Button for non-connected users */}
          {!isConnected && (
            <div className="mt-auto mb-6">
              <button
                onClick={openConnectModal}
                type="button"
                className="w-full bg-[#7DF9FF] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all px-4 py-4"
              >
                CONNECT WALLET
              </button>
            </div>
          )}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto bg-[#FFF9F0]">{children}</main>
    </div>
  );
}

export default Sidebar;