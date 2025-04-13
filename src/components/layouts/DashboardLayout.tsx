"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Pengguna",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Dashboard",
    href: "/ustadz",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [UserRole.USTADZ],
  },
  {
    title: "Penilaian",
    href: "/ustadz/assessments",
    icon: <BookOpen className="h-5 w-5" />,
    roles: [UserRole.USTADZ],
  },
  {
    title: "Laporan",
    href: "/ustadz/reports",
    icon: <FileText className="h-5 w-5" />,
    roles: [UserRole.USTADZ],
  },
  {
    title: "Dashboard",
    href: "/santri",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [UserRole.SANTRI],
  },
  {
    title: "Nilai",
    href: "/santri/assessments",
    icon: <BookOpen className="h-5 w-5" />,
    roles: [UserRole.SANTRI],
  },
  {
    title: "Rapor",
    href: "/santri/report",
    icon: <FileText className="h-5 w-5" />,
    roles: [UserRole.SANTRI],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = session?.user?.role as UserRole | undefined;
  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(userRole as UserRole)
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>e-Rapor TPQ</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <nav className="grid gap-2 p-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 px-3 py-2 text-sm font-medium"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>e-Rapor TPQ</span>
        </Link>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 flex-col border-r bg-card md:flex">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>e-Rapor TPQ</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-2 p-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-3 px-3 py-2 text-sm font-medium"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Keluar
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
