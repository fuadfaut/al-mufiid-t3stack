"use client";

import DashboardLayout from "./DashboardLayout";

interface SantriLayoutProps {
  children: React.ReactNode;
}

export default function SantriLayout({ children }: SantriLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
