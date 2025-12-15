

import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";

import { sepolia } from "viem/chains";

// export const reactiveMainnet: Chain = {
//   id: 1597,
//   name: 'Reactive Mainnet',
//   nativeCurrency: {
//     name: 'REACT',
//     symbol: 'REACT',
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: { http: ['https://mainnet.rpc.reactive.network'] }
//   },
//   blockExplorers: {
//     default: { name: 'ReactiveScan', url: 'https://reactscan.net/' }
//   },
// }

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        coinbaseWallet
      ],
    },
  ],
  {
    appName: 'ReactPad',
    projectId: '05f1bc7c3d4ce4d40fe55e540e58c2da', // Replace with your WalletConnect project ID
  }
);

export const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}