"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import UstadzLayout from "~/components/layouts/UstadzLayout";

type Student = {
  id: string;
  name: string | null;
  student: {
    nis: string;
    class: string;
    jilid: string;
  } | null;
};

type Assessment = {
  id: string;
  date: string;
  surah: string | null;
  jilid: string | null;
  notes: string | null;
  finalScore: number | null;
  student: Student;
  fashahahAssessment: {
    id: string;
    makharijulHuruf: number;
    sifatulHuruf: number;
    harakat: number;
    madQashr: number;
    score: number;
  } | null;
  tajwidAssessment: {
    id: string;
    hukumNunMati: number;
    hukumMimMati: number;
    mad: number;
    waqafIbtida: number;
    tafkhimTarqiq: number;
    score: number;
  } | null;
  tartilAssessment: {
    id: string;
    tempo: number;
    calmness: number;
    fluency: number;
    score: number;
  } | null;
  voiceAssessment: {
    id: string;
    voice: number;
    tone: number;
    score: number;
  } | null;
  adabAssessment: {
    id: string;
    attitude: number;
    score: number;
  } | null;
};

export default function AssessmentPDFPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    // Redirect if not ustadz
    if (status === "authenticated" && session?.user?.role !== UserRole.USTADZ) {
      router.push("/");
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Fetch assessment
    if (status === "authenticated") {
      fetchAssessment();
    }
  }, [status, session, router, params.id]);

  useEffect(() => {
    // Generate PDF when assessment data is loaded
    if (assessment && !pdfGenerated) {
      generatePDF();
      setPdfGenerated(true);
    }
  }, [assessment, pdfGenerated]);

  const fetchAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ustadz/assessments/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assessment");
      }
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError("Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    if (!assessment) return;

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("LAPORAN PENILAIAN SANTRI", 105, 15, { align: "center" });
      doc.text("TPQ AL-MUFID", 105, 22, { align: "center" });
      
      // Add line
      doc.setLineWidth(0.5);
      doc.line(14, 25, 196, 25);
      
      // Student information
      doc.setFontSize(12);
      doc.text("Informasi Santri:", 14, 35);
      
      const studentInfo = [
        ["Nama", ": " + (assessment.student.name || "-")],
        ["NIS", ": " + (assessment.student.student?.nis || "-")],
        ["Kelas", ": " + (assessment.student.student?.class || "-")],
        ["Jilid", ": " + (assessment.student.student?.jilid || "-")],
      ];
      
      autoTable(doc, {
        startY: 38,
        head: [],
        body: studentInfo,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 30 } },
      });
      
      // Assessment information
      doc.text("Informasi Penilaian:", 14, 65);
      
      const assessmentInfo = [
        ["Tanggal", ": " + new Date(assessment.date).toLocaleDateString("id-ID")],
        ["Surah", ": " + (assessment.surah || "-")],
        ["Jilid", ": " + (assessment.jilid || "-")],
        ["Catatan", ": " + (assessment.notes || "-")],
      ];
      
      autoTable(doc, {
        startY: 68,
        head: [],
        body: assessmentInfo,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 30 } },
      });
      
      // Fashahah Assessment
      if (assessment.fashahahAssessment) {
        doc.text("Penilaian Fashahah:", 14, 95);
        
        const fashahahData = [
          ["Makharijul Huruf", assessment.fashahahAssessment.makharijulHuruf.toString()],
          ["Sifatul Huruf", assessment.fashahahAssessment.sifatulHuruf.toString()],
          ["Harakat", assessment.fashahahAssessment.harakat.toString()],
          ["Mad-Qashr", assessment.fashahahAssessment.madQashr.toString()],
          ["Nilai Fashahah", assessment.fashahahAssessment.score.toFixed(2)],
        ];
        
        autoTable(doc, {
          startY: 98,
          head: [["Komponen", "Nilai"]],
          body: fashahahData,
          theme: "striped",
          headStyles: { fillColor: [76, 175, 80] },
          styles: { fontSize: 10 },
        });
      }
      
      // Tajwid Assessment
      if (assessment.tajwidAssessment) {
        const tajwidStartY = doc.lastAutoTable?.finalY || 130;
        doc.text("Penilaian Tajwid:", 14, tajwidStartY + 10);
        
        const tajwidData = [
          ["Hukum Nun Mati", assessment.tajwidAssessment.hukumNunMati.toString()],
          ["Hukum Mim Mati", assessment.tajwidAssessment.hukumMimMati.toString()],
          ["Mad", assessment.tajwidAssessment.mad.toString()],
          ["Waqaf Ibtida'", assessment.tajwidAssessment.waqafIbtida.toString()],
          ["Tafkhim Tarqiq", assessment.tajwidAssessment.tafkhimTarqiq.toString()],
          ["Nilai Tajwid", assessment.tajwidAssessment.score.toFixed(2)],
        ];
        
        autoTable(doc, {
          startY: tajwidStartY + 13,
          head: [["Komponen", "Nilai"]],
          body: tajwidData,
          theme: "striped",
          headStyles: { fillColor: [33, 150, 243] },
          styles: { fontSize: 10 },
        });
      }
      
      // Tartil Assessment
      if (assessment.tartilAssessment) {
        const tartilStartY = doc.lastAutoTable?.finalY || 180;
        doc.text("Penilaian Tartil:", 14, tartilStartY + 10);
        
        const tartilData = [
          ["Tempo", assessment.tartilAssessment.tempo.toString()],
          ["Ketenangan", assessment.tartilAssessment.calmness.toString()],
          ["Kelancaran", assessment.tartilAssessment.fluency.toString()],
          ["Nilai Tartil", assessment.tartilAssessment.score.toFixed(2)],
        ];
        
        autoTable(doc, {
          startY: tartilStartY + 13,
          head: [["Komponen", "Nilai"]],
          body: tartilData,
          theme: "striped",
          headStyles: { fillColor: [156, 39, 176] },
          styles: { fontSize: 10 },
        });
      }
      
      // Add a new page if needed
      if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > 220) {
        doc.addPage();
      }
      
      // Voice Assessment
      if (assessment.voiceAssessment) {
        const voiceStartY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 10;
        doc.text("Penilaian Suara & Nada:", 14, voiceStartY + 10);
        
        const voiceData = [
          ["Suara", assessment.voiceAssessment.voice.toString()],
          ["Nada", assessment.voiceAssessment.tone.toString()],
          ["Nilai Suara & Nada", assessment.voiceAssessment.score.toFixed(2)],
        ];
        
        autoTable(doc, {
          startY: voiceStartY + 13,
          head: [["Komponen", "Nilai"]],
          body: voiceData,
          theme: "striped",
          headStyles: { fillColor: [255, 152, 0] },
          styles: { fontSize: 10 },
        });
      }
      
      // Adab Assessment
      if (assessment.adabAssessment) {
        const adabStartY = doc.lastAutoTable?.finalY || 240;
        doc.text("Penilaian Adab & Sikap:", 14, adabStartY + 10);
        
        const adabData = [
          ["Adab & Sikap", assessment.adabAssessment.attitude.toString()],
          ["Nilai Adab & Sikap", assessment.adabAssessment.score.toFixed(2)],
        ];
        
        autoTable(doc, {
          startY: adabStartY + 13,
          head: [["Komponen", "Nilai"]],
          body: adabData,
          theme: "striped",
          headStyles: { fillColor: [244, 67, 54] },
          styles: { fontSize: 10 },
        });
      }
      
      // Final Score
      const finalScoreY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 270;
      doc.setFontSize(14);
      doc.text("Nilai Akhir:", 14, finalScoreY);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(assessment.finalScore ? assessment.finalScore.toFixed(2) : "-", 50, finalScoreY);
      
      // Signature
      const signatureY = finalScoreY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 140, signatureY);
      doc.text("Ustadz/Ustadzah", 140, signatureY + 25);
      doc.text(`(${session?.user?.name || ""})`, 140, signatureY + 30);
      
      // Save the PDF
      doc.save(`Penilaian_${assessment.student.name}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF");
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <UstadzLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
            <p>Loading...</p>
          </div>
        </div>
      </UstadzLayout>
    );
  }

  return (
    <UstadzLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">PDF Penilaian</h1>
          <button
            onClick={() => router.push(`/ustadz/assessments/${params.id}`)}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Kembali
          </button>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-center">
              {pdfGenerated ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <h2 className="mt-4 text-xl font-medium text-gray-800">PDF Berhasil Dibuat</h2>
                  <p className="mt-2 text-gray-600">
                    PDF telah diunduh ke perangkat Anda. Jika unduhan tidak dimulai secara otomatis,
                    klik tombol di bawah ini.
                  </p>
                  <button
                    onClick={generatePDF}
                    className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Unduh PDF Lagi
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500 mx-auto"></div>
                  <h2 className="text-xl font-medium text-gray-800">Membuat PDF...</h2>
                  <p className="mt-2 text-gray-600">
                    Mohon tunggu sementara kami membuat PDF penilaian.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </UstadzLayout>
  );
}
