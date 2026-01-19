import type { PresaleCategory, PresaleSocials } from "@/lib/store/launchpad-presale-store";
import type { Address } from "viem";

export interface PresaleMetadata {
  category?: PresaleCategory;
  socials?: PresaleSocials;
  description?: string;
  logo?: string;
}

// Map presale contract addresses to their metadata (socials, category, etc.)
// Add entries here for each presale that has social links
export const presaleMetadataMap: Record<string, PresaleMetadata> = {
  // Example entry - replace with actual presale addresses:
  // "0x1234...": {
  //   category: "defi",
  //   socials: {
  //     twitter: "https://twitter.com/projectname",
  //     telegram: "https://t.me/projectname",
  //     discord: "https://discord.gg/projectname",
  //     website: "https://projectname.com",
  //   },
  //   description: "A revolutionary DeFi protocol",
  //   logo: "https://example.com/logo.png",
  // },
};

export function getPresaleMetadata(address: Address | string): PresaleMetadata | undefined {
  const normalizedAddress = address.toLowerCase();
  return presaleMetadataMap[normalizedAddress];
}
