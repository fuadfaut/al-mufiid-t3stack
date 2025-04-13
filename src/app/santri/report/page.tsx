"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import SantriLayout from "~/components/layouts/SantriLayout";

type Assessment = {
  id: string;
  date: string;
  surah: string | null;
  jilid: string | null;
  notes: string | null;
  finalScore: number | null;
  createdBy: {
    name: string | null;
  };
  fashahahAssessment: {
    score: number;
  } | null;
  tajwidAssessment: {
    score: number;
  } | null;
  tartilAssessment: {
    score: number;
  } | null;
  voiceAssessment: {
    score: number;
  } | null;
  adabAssessment: {
    score: number;
  } | null;
};

export default function SantriReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    // Redirect if not santri
    if (status === "authenticated" && session?.user?.role !== UserRole.SANTRI) {
      router.push("/");
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Fetch assessments
    if (status === "authenticated") {
      fetchAssessments();
    }
  }, [status, session, router]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    setPdfGenerated(false);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);

      const response = await fetch(`/api/santri/assessments?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assessments");
      }
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError("Failed to load assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssessments();
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
    });
    // Fetch assessments without filters
    setTimeout(fetchAssessments, 0);
  };

  const generatePDF = () => {
    if (assessments.length === 0) {
      setError("Tidak ada data penilaian untuk dibuat laporan");
      return;
    }

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
        ["Nama", ": " + (session?.user?.name || "-")],
        ["Periode", ": " + (filters.fromDate ? `${filters.fromDate} s/d ${filters.toDate || "sekarang"}` : "Semua waktu")],
      ];
      
      autoTable(doc, {
        startY: 38,
        head: [],
        body: studentInfo,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 30 } },
      });
      
      // Assessment summary
      doc.text("Ringkasan Penilaian:", 14, 55);
      
      // Calculate average scores
      let totalFashahah = 0;
      let countFashahah = 0;
      let totalTajwid = 0;
      let countTajwid = 0;
      let totalTartil = 0;
      let countTartil = 0;
      let totalVoice = 0;
      let countVoice = 0;
      let totalAdab = 0;
      let countAdab = 0;
      let totalFinal = 0;
      let countFinal = 0;
      
      assessments.forEach((assessment) => {
        if (assessment.fashahahAssessment) {
          totalFashahah += assessment.fashahahAssessment.score;
          countFashahah++;
        }
        if (assessment.tajwidAssessment) {
          totalTajwid += assessment.tajwidAssessment.score;
          countTajwid++;
        }
        if (assessment.tartilAssessment) {
          totalTartil += assessment.tartilAssessment.score;
          countTartil++;
        }
        if (assessment.voiceAssessment) {
          totalVoice += assessment.voiceAssessment.score;
          countVoice++;
        }
        if (assessment.adabAssessment) {
          totalAdab += assessment.adabAssessment.score;
          countAdab++;
        }
        if (assessment.finalScore !== null) {
          totalFinal += assessment.finalScore;
          countFinal++;
        }
      });
      
      const avgFashahah = countFashahah > 0 ? totalFashahah / countFashahah : 0;
      const avgTajwid = countTajwid > 0 ? totalTajwid / countTajwid : 0;
      const avgTartil = countTartil > 0 ? totalTartil / countTartil : 0;
      const avgVoice = countVoice > 0 ? totalVoice / countVoice : 0;
      const avgAdab = countAdab > 0 ? totalAdab / countAdab : 0;
      const avgFinal = countFinal > 0 ? totalFinal / countFinal : 0;
      
      const summaryData = [
        ["Jumlah Penilaian", assessments.length.toString()],
        ["Rata-rata Nilai Fashahah", avgFashahah.toFixed(2)],
        ["Rata-rata Nilai Tajwid", avgTajwid.toFixed(2)],
        ["Rata-rata Nilai Tartil", avgTartil.toFixed(2)],
        ["Rata-rata Nilai Suara & Nada", avgVoice.toFixed(2)],
        ["Rata-rata Nilai Adab & Sikap", avgAdab.toFixed(2)],
        ["Rata-rata Nilai Akhir", avgFinal.toFixed(2)],
      ];
      
      autoTable(doc, {
        startY: 58,
        head: [["Kategori", "Nilai"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [103, 58, 183] },
        styles: { fontSize: 10 },
      });
      
      // Assessment details
      const detailsStartY = doc.lastAutoTable?.finalY || 120;
      doc.text("Detail Penilaian:", 14, detailsStartY + 10);
      
      const assessmentData = assessments.map((assessment) => [
        new Date(assessment.date).toLocaleDateString("id-ID"),
        assessment.surah || assessment.jilid || "-",
        assessment.fashahahAssessment?.score.toFixed(2) || "-",
        assessment.tajwidAssessment?.score.toFixed(2) || "-",
        assessment.tartilAssessment?.score.toFixed(2) || "-",
        assessment.adabAssessment?.score.toFixed(2) || "-",
        assessment.finalScore?.toFixed(2) || "-",
        assessment.createdBy.name || "-",
      ]);
      
      autoTable(doc, {
        startY: detailsStartY + 13,
        head: [["Tanggal", "Surah/Jilid", "Fashahah", "Tajwid", "Tartil", "Adab", "Nilai Akhir", "Ustadz/Ustadzah"]],
        body: assessmentData,
        theme: "striped",
        headStyles: { fillColor: [103, 58, 183] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          7: { cellWidth: 30 },
        },
      });
      
      // Signature
      const signatureY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 270;
      doc.setFontSize(10);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, signatureY);
      
      // Save the PDF
      doc.save(`Rapor_${session?.user?.name}_${new Date().toISOString().split("T")[0]}.pdf`);
      setPdfGenerated(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF");
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <SantriLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
            <p>Loading...</p>
          </div>
        </div>
      </SantriLayout>
    );
  }

  return (
    <SantriLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Unduh Rapor</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-lg font-medium">Filter Periode</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
                Dari Tanggal
              </label>
              <input
                id="fromDate"
                name="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
                Sampai Tanggal
              </label>
              <input
                id="toDate"
                name="toDate"
                type="date"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>

            <div className="flex items-end gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Report Summary */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Ringkasan Rapor</h2>
          
          {assessments.length === 0 ? (
            <p className="text-gray-500">Tidak ada data penilaian untuk periode yang dipilih</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Jumlah Penilaian</p>
                  <p className="text-2xl font-bold text-purple-800">{assessments.length}</p>
                </div>
                
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {assessments.reduce((sum, assessment) => sum + (assessment.finalScore || 0), 0) / 
                      assessments.filter(a => a.finalScore !== null).length || 0}
                  </p>
                </div>
                
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Periode</p>
                  <p className="text-sm font-medium text-green-800">
                    {filters.fromDate ? 
                      `${filters.fromDate} s/d ${filters.toDate || "sekarang"}` : 
                      "Semua waktu"}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={generatePDF}
                  className="rounded-md bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
                >
                  Unduh Rapor PDF
                </button>
              </div>
              
              {pdfGenerated && (
                <div className="mt-4 rounded-md bg-green-50 p-4 text-center text-sm text-green-700">
                  PDF berhasil dibuat dan diunduh
                </div>
              )}
            </>
          )}
        </div>

        {/* Assessment List */}
        {assessments.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Surah/Jilid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nilai Akhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ustadz/Ustadzah
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(assessment.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {assessment.surah ? (
                        <span>Surah: {assessment.surah}</span>
                      ) : assessment.jilid ? (
                        <span>Jilid: {assessment.jilid}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {assessment.finalScore !== null ? (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            assessment.finalScore >= 80
                              ? "bg-green-100 text-green-800"
                              : assessment.finalScore >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {assessment.finalScore.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {assessment.createdBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SantriLayout>
  );
}
