"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApprovalStatus } from "@prisma/client";
import { AlertTriangle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export default function PendingApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // If user is authenticated and approved, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user?.approvalStatus === ApprovalStatus.APPROVED) {
      setIsRedirecting(true);

      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "USTADZ":
          router.push("/ustadz");
          break;
        case "SANTRI":
          router.push("/santri");
          break;
        default:
          router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  if (status === "loading" || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
          <CardDescription>
            Akun Anda sedang menunggu persetujuan dari admin. Anda akan mendapatkan
            akses penuh setelah akun Anda disetujui.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleSignOut} className="w-full">
            Keluar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
