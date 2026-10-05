import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "../components/ui/sidebar";
import { AuthProvider } from "../providers/auth-provider";
import { Toaster } from "../components/ui/toast";
import { TooltipProvider } from "../components/ui/tooltip";
import { QueryProvider } from "../providers/query-provider";
import AppHeader from '../components/app-header';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IngetAnime",
  description: "Eksplorasi platform anime",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <SidebarProvider defaultOpen={false}>
              <TooltipProvider>
                <div className="w-full flex flex-col">
                  <AppHeader />
                  <main className="w-full h-full">{children}</main>
                  <Toaster />
                </div>
              </TooltipProvider>
            </SidebarProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
