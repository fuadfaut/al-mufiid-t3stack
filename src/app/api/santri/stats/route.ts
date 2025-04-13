import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is a santri
    const session = await auth();
    if (!session || session.user.role !== UserRole.SANTRI) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get total assessments for this santri
    const totalAssessments = await db.assessment.count({
      where: { studentId: session.user.id },
    });

    // Get average score
    const assessments = await db.assessment.findMany({
      where: { 
        studentId: session.user.id,
        finalScore: { not: null }
      },
      select: { finalScore: true },
    });

    let averageScore = 0;
    if (assessments.length > 0) {
      const sum = assessments.reduce((acc, curr) => acc + (curr.finalScore || 0), 0);
      averageScore = sum / assessments.length;
    }

    // Get recent assessments
    const recentAssessments = await db.assessment.findMany({
      where: { studentId: session.user.id },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        date: true,
        surah: true,
        jilid: true,
        finalScore: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalAssessments,
      averageScore,
      recentAssessments,
    });
  } catch (error) {
    console.error("Error fetching santri stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
