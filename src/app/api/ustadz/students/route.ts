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

    // Fetch all approved santri with their student data
    const students = await db.user.findMany({
      where: {
        role: UserRole.SANTRI,
        approvalStatus: ApprovalStatus.APPROVED,
      },
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
