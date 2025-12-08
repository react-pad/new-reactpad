import Providers from "@/components/DynamicProviders";
import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";

const openSans = Albert_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReactPad",
  description: "A Token launchpad on Reactive Network",
  icons: {
    icon: "https://res.cloudinary.com/dma1c8i6n/image/upload/v1764289640/reactpad_swlsov.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
