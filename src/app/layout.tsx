import type { Metadata } from "next";
import React, { Suspense } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canaoaves Administração",
  description: "Painel administrativo do site Canaoaves",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <Suspense>
          <Providers>
            {/* <ThemeProvider> */}
              {/* <RefineContext> */}
                {children}
                <Toaster />
              {/* </RefineContext> */}
            {/* </ThemeProvider> */}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
