import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole, ApprovalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get total users count
    const totalUsers = await db.user.count();

    // Get pending approvals count
    const pendingApprovals = await db.user.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });

    // Get total santri count
    const totalSantri = await db.user.count({
      where: { role: UserRole.SANTRI },
    });

    // Get total ustadz count
    const totalUstadz = await db.user.count({
      where: { role: UserRole.USTADZ },
    });

    // Get total assessments count
    const totalAssessments = await db.assessment.count();

    return NextResponse.json({
      totalUsers,
      pendingApprovals,
      totalSantri,
      totalUstadz,
      totalAssessments,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
