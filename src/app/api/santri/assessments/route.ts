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

    // Get query parameters
    const url = new URL(req.url);
    const surah = url.searchParams.get("surah");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    // Build filter
    const filter: any = {
      studentId: session.user.id,
    };

    if (surah) {
      filter.surah = {
        contains: surah,
      };
    }

    if (fromDate || toDate) {
      filter.date = {};
      
      if (fromDate) {
        filter.date.gte = new Date(fromDate);
      }
      
      if (toDate) {
        filter.date.lte = new Date(toDate);
      }
    }

    // Fetch assessments
    const assessments = await db.assessment.findMany({
      where: filter,
      orderBy: {
        date: "desc",
      },
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

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
