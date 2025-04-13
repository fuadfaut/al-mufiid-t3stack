import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { UserRole, ApprovalStatus } from "@prisma/client";

// Using a simple hash for development purposes
const simpleHash = (str: string) => {
  return Buffer.from(`${str}_hashed`).toString('base64');
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      nis,
      class: className,
      jilid,
      parentName,
      phoneNumber,
      address,
    } = body;

    // Check if required fields are provided
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Check if NIS already exists (for santri)
    if (role === UserRole.SANTRI && nis) {
      const existingStudent = await db.student.findUnique({
        where: { nis },
      });

      if (existingStudent) {
        return NextResponse.json(
          { message: "NIS sudah terdaftar" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = simpleHash(password);

    // Set approval status based on role
    // Santri need approval, Ustadz need approval, Admin is pre-approved
    const approvalStatus =
      role === UserRole.ADMIN
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.PENDING;

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        approvalStatus,
      },
    });

    // Create student record if role is SANTRI
    if (role === UserRole.SANTRI) {
      await db.student.create({
        data: {
          nis,
          class: className,
          jilid,
          parentName,
          phoneNumber,
          address,
          userId: user.id,
        },
      });
    }

    // Return success without exposing sensitive data
    return NextResponse.json(
      {
        message: "Pendaftaran berhasil",
        requiresApproval: approvalStatus === ApprovalStatus.PENDING,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
}
