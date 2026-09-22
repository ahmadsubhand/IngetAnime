import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import AppLogo from '../components/app-logo';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../components/ui/input-group';
import { Search } from 'lucide-react';
import { AuthProvider } from '../providers/auth-provider';
import AppProfile from '../components/app-profile';
import { Toaster } from '../components/ui/toast';
import { TooltipProvider } from '../components/ui/tooltip';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SidebarProvider defaultOpen={false}>
            <TooltipProvider>
              <div className='w-full flex flex-col'>
                <header className='pr-4 py-4 w-full flex justify-between'>
                  <SidebarTrigger className={'md:hidden'}/>
                  <AppLogo className='pl-2' />
                  <InputGroup className='ml-5 md:max-w-100'>
                    <InputGroupInput placeholder='Cari anime ...' />
                    <InputGroupAddon align={'inline-end'}>
                      <InputGroupButton><Search /></InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  <div className="flex gap-6">
                    <AppSidebar />
                    <div className="hidden md:block">
                      <AppProfile size='sm' />
                    </div>
                  </div>
                </header>
                <main className='w-full h-full'>
                  {children}
                </main>
                <Toaster />
              </div>
            </TooltipProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
