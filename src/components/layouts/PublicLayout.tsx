"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Al-Mufid Loa Bakung</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/landing"
              className={`text-sm font-medium ${pathname === "/landing" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Home
            </Link>
            <Link
              href="/tentang"
              className={`text-sm font-medium ${pathname === "/tentang" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Tentang
            </Link>
            <Link
              href="/auth/login"
              className={`text-sm font-medium ${pathname === "/auth/login" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Login
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                Daftar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-6">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">
              Taman Pendidikan Al-Qur&apos;an Al-Mufid Loa Bakung Samarinda
            </p>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TPQ Al-Mufid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
