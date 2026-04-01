'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/use-auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Bell, HelpCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

function TopHeader() {
  const { user } = useAuthStore();
  return (
    <div className="h-14 border-b border-[var(--border)] bg-white flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search portfolios or transactions..."
          className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] placeholder:text-[var(--text-tertiary)] transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>
      </div>
    </div>
  );
}

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

  const showChrome = mounted && isAuthenticated && pathname !== '/login';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {showChrome && <Sidebar />}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showChrome && <TopHeader />}
            <main className="flex-1 overflow-y-auto">
              <div className={showChrome ? 'p-6' : ''}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
