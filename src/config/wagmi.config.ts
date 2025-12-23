import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { baseSepolia } from "viem/chains";
import { createConfig, http } from "wagmi";

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
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
});
