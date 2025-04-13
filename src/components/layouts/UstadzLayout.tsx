"use client";

import DashboardLayout from "./DashboardLayout";

interface UstadzLayoutProps {
  children: React.ReactNode;
}

export default function UstadzLayout({ children }: UstadzLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
