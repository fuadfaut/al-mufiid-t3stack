import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole, ApprovalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an ustadz
    const session = await auth();
    if (!session || session.user.role !== UserRole.USTADZ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get total assessments created by this ustadz
    const totalAssessments = await db.assessment.count({
      where: { createdById: session.user.id },
    });

    // Get total santri count (approved only)
    const totalSantri = await db.user.count({
      where: { 
        role: UserRole.SANTRI,
        approvalStatus: ApprovalStatus.APPROVED
      },
    });

    // Get recent assessments
    const recentAssessments = await db.assessment.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        student: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalAssessments,
      totalSantri,
      recentAssessments,
    });
  } catch (error) {
    console.error("Error fetching ustadz stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
