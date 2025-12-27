import { REACT_TOKEN_PRICE_USD } from "@/config/config";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Coins,
  LayoutDashboard,
  Menu,
  Pencil,
  Rocket,
  WalletMinimal
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { baseSepolia } from "viem/chains";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";

const navItems = [
  { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
  { name: "Launchpad", href: "/projects", icon: Rocket },
  { name: "Markets", href: "/markets", icon: Coins },
];

// Re-usable component for sidebar content
const SidebarContent = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { openConnectModal } = useConnectModal();
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isConnected = !!address;
  const isWrongNetwork = isConnected && chain?.id !== baseSepolia.id;

  const { data: balanceData } = useBalance({ address });
  const balance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const valueUsd = balance * REACT_TOKEN_PRICE_USD;

  return (
    <div className="flex flex-col flex-1 h-full">
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

      {isConnected && (
        <div className="mx-6 my-3 p-4 border-4 border-black bg-[#2FFF2F] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-black uppercase">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button className="hover:scale-110 transition-transform">
              <WalletMinimal size={18} strokeWidth={3} />
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
              onClick={() => switchChain?.({ chainId: baseSepolia.id })}
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

      <nav className="flex-1 flex flex-col px-6 mt-6">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 transition-all font-black uppercase text-xs tracking-wider border-2 border-black ${isActive
                    ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                    : "text-black bg-white hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" strokeWidth={2.5} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 mb-3">
          <Link
            to="/dashboard/create"
            className={`flex items-center justify-center w-full px-4 py-4 transition-all font-black uppercase text-xs tracking-wider border-4 border-black ${pathname === "/dashboard/create"
              ? "bg-[#FF4911] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
              : "bg-[#FF00F5] text-black hover:bg-[#FF4911] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              }`}
          >
            <Pencil className="w-5 h-5 mr-2" strokeWidth={3} />
            CREATE
          </Link>
        </div>

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
  );
};


export function Sidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none text-black"
          }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black border-r-4 border-black z-40 transform transition-transform ease-in-out duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent />
      </div>

      <div className="flex h-screen bg-[#FFF9F0] text-black">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r-4 border-black">
              <SidebarContent />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden relative z-10 flex-shrink-0 h-16 bg-white border-b-4 border-black flex items-center justify-between px-4">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dma1c8i6n/image/upload/v1764289640/reactpad_swlsov.png"
                alt="ReactPad Logo"
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

export default Sidebar;