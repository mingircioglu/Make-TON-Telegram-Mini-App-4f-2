    'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>TON Connect Demo</title>
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://emerald-abstract-vole-714.mypinata.cloud/ipfs/QmYdwjuo3x4nzG4Hd95RDRe2RxeA9AzwvwAEamPyEuXeWa">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}