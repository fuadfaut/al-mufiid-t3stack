import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { UserRole, ApprovalStatus } from "@prisma/client";

export default async function Home() {
  const session = await auth();

  // If not authenticated, redirect to landing page
  if (!session) {
    redirect("/landing");
  }

  // Check if user is approved
  if (session.user.approvalStatus !== ApprovalStatus.APPROVED) {
    redirect("/pending-approval");
  }

  // Redirect based on role
  switch (session.user.role) {
    case UserRole.ADMIN:
      redirect("/admin");
    case UserRole.USTADZ:
      redirect("/ustadz");
    case UserRole.SANTRI:
      redirect("/santri");
    default:
      redirect("/landing");
  }

  // This part will never be reached due to redirects
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
        <h1 className="text-2xl font-bold mb-2">e-Rapor TPQ Al-Mufid</h1>
        <p>Mengarahkan ke halaman yang sesuai...</p>
      </div>
    </main>
  );
}
