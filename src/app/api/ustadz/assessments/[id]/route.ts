import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Check if user is authenticated and is an ustadz
    const session = await auth();
    if (!session || session.user.role !== UserRole.USTADZ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if assessment exists and belongs to this ustadz
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.createdById !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own assessments" },
        { status: 403 }
      );
    }

    // Delete assessment (this will cascade delete related records due to our schema setup)
    await db.assessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Check if user is authenticated and is an ustadz
    const session = await auth();
    if (!session || session.user.role !== UserRole.USTADZ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch assessment with all related data
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            student: {
              select: {
                nis: true,
                class: true,
                jilid: true,
              },
            },
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

    // Check if assessment belongs to this ustadz
    if (assessment.createdById !== session.user.id) {
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
