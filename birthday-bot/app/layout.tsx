"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";

// List of supported wallets to be used by the AptosWalletAdapterProvider below.
// 
// NOTE: Each wallet is a plugin that implements the Aptos wallet standard.
const wallets = [new PetraWallet(), new MartianWallet()];

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* 
            This is the provider from the Aptos wallet adapter. Anything inside of this provider can 
            use the useWallet hook to access the wallet.
          */}
          <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
            {children}
          </AptosWalletAdapterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
