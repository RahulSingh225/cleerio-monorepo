'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/use-auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    initAuth();
    setMounted(true);
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isChecking && !isAuthenticated && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }
  }, [mounted, isChecking, isAuthenticated, pathname, router]);

  const showSidebar = mounted && isAuthenticated && pathname !== '/login';

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-zinc-50 antialiased selection:bg-blue-500/30`}>
        <div className="flex h-screen overflow-hidden">
          {showSidebar && <Sidebar />}
          <main className={`flex-1 relative overflow-y-auto focus:outline-none ${!showSidebar ? 'w-full' : ''}`}>
             <div className="transition-all duration-700 ease-in-out">
                {children}
             </div>
          </main>
        </div>
      </body>
    </html>
  );
}
