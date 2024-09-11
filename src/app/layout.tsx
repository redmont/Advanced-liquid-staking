import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import ProviderWrapper from "./providers/dynamic";
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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ProviderWrapper>
          <Navbar />
          {children}
        </ProviderWrapper>
      </body>
    </html>
  );
}
