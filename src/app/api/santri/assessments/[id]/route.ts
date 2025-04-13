import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Check if user is authenticated and is a santri
    const session = await auth();
    if (!session || session.user.role !== UserRole.SANTRI) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch assessment with all related data
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        fashahahAssessment: true,
        tajwidAssessment: true,
        tartilAssessment: true,
        voiceAssessment: true,
        adabAssessment: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if assessment belongs to this santri
    if (assessment.studentId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only view your own assessments" },
        { status: 403 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
