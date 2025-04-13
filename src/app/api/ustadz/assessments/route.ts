import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an ustadz
    const session = await auth();
    if (!session || session.user.role !== UserRole.USTADZ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      studentId,
      date,
      surah,
      jilid,
      notes,
      
      // Scores
      fashahahScore,
      tajwidScore,
      tartilScore,
      voiceScore,
      adabScore,
      finalScore,
      
      // Fashahah assessment
      makharijulHuruf,
      sifatulHuruf,
      harakat,
      madQashr,
      
      // Tajwid assessment
      hukumNunMati,
      hukumMimMati,
      mad,
      waqafIbtida,
      tafkhimTarqiq,
      
      // Tartil assessment
      tempo,
      calmness,
      fluency,
      
      // Voice assessment
      voice,
      tone,
      
      // Adab assessment
      attitude,
    } = body;

    // Validate required fields
    if (!studentId || !date) {
      return NextResponse.json(
        { message: "Santri dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    // Create assessment with all related data
    const assessment = await db.assessment.create({
      data: {
        date: new Date(date),
        surah,
        jilid,
        notes,
        finalScore,
        createdById: session.user.id,
        studentId,
        
        // Create related assessment components
        fashahahAssessment: {
          create: {
            makharijulHuruf,
            sifatulHuruf,
            harakat,
            madQashr,
            score: fashahahScore,
          },
        },
        
        tajwidAssessment: {
          create: {
            hukumNunMati,
            hukumMimMati,
            mad,
            waqafIbtida,
            tafkhimTarqiq,
            score: tajwidScore,
          },
        },
        
        tartilAssessment: {
          create: {
            tempo,
            calmness,
            fluency,
            score: tartilScore,
          },
        },
        
        voiceAssessment: {
          create: {
            voice,
            tone,
            score: voiceScore,
          },
        },
        
        adabAssessment: {
          create: {
            attitude,
            score: adabScore,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Penilaian berhasil disimpan", assessmentId: assessment.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan penilaian" },
      { status: 500 }
    );
  }
}

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

    // Get query parameters
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const surah = url.searchParams.get("surah");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    // Build filter
    const filter: any = {
      createdById: session.user.id,
    };

    if (studentId) {
      filter.studentId = studentId;
    }

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

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
