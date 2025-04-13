import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "~/components/providers/SessionProvider";
import { ToastProvider } from "~/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "e-Rapor TPQ Al-Mufid",
  description: "Aplikasi e-Rapor untuk Taman Pendidikan Al-Qur'an (TPQ)",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-background">
        <TRPCReactProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
