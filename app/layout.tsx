import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { PreferencesProvider } from "@/lib/preferences";
import { Sidebar } from "@/components/layout/navigation/sidebar";
import { MobileNav } from "@/components/layout/navigation/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Personal finance dashboard powered by Google Sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", inter.variable)} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans antialiased">
        <ThemeProvider>
        <PreferencesProvider>
          <Sidebar />
          <main className="md:pl-64 pb-16 md:pb-0 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
          <MobileNav />
          <Toaster position="top-center" />
        </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}