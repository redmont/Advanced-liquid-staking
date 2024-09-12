import "@/styles/globals.css";
import "@fontsource-variable/inter";

import { type Metadata } from "next";
import ProviderWrapper from "../providers/dynamic";
import Navbar from "../components/navbar";

export const metadata: Metadata = {
  title: "RealBet.io",
  description: "Games for the real world",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background">
        <ProviderWrapper>
          <Navbar />
          {children}
        </ProviderWrapper>
      </body>
    </html>
  );
}
