"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
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

export default function SantriAssessmentDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch assessment
    if (status === "authenticated") {
      fetchAssessment();
    }
  }, [status, session, router, params.id]);

  const fetchAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/santri/assessments/${params.id}`);
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

  const handleExportPDF = () => {
    router.push(`/santri/assessments/${params.id}/pdf`);
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

  if (error || !assessment) {
    return (
      <SantriLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error || "Penilaian tidak ditemukan"}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push("/santri/assessments")}
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Kembali ke Daftar Penilaian
            </button>
          </div>
        </div>
      </SantriLayout>
    );
  }

  return (
    <SantriLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Detail Penilaian</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/santri/assessments")}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Kembali
            </button>
            <button
              onClick={handleExportPDF}
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Unduh PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Assessment Info */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Informasi Penilaian</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal</p>
                  <p className="text-gray-800">
                    {new Date(assessment.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                {assessment.surah && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Surah</p>
                    <p className="text-gray-800">{assessment.surah}</p>
                  </div>
                )}
                {assessment.jilid && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jilid</p>
                    <p className="text-gray-800">{assessment.jilid}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Ustadz/Ustadzah</p>
                  <p className="text-gray-800">{assessment.createdBy.name}</p>
                </div>
                {assessment.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Catatan</p>
                    <p className="text-gray-800">{assessment.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Nilai Akhir</p>
                  <p className="text-xl font-bold text-gray-800">
                    {assessment.finalScore !== null ? assessment.finalScore.toFixed(2) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Detail Penilaian</h2>

              {/* Fashahah Assessment */}
              {assessment.fashahahAssessment && (
                <div className="mb-6">
                  <h3 className="mb-2 font-medium text-gray-700">
                    Penilaian Fashahah{" "}
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {assessment.fashahahAssessment.score.toFixed(2)}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Makharijul Huruf</p>
                      <p className="text-gray-800">{assessment.fashahahAssessment.makharijulHuruf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sifatul Huruf</p>
                      <p className="text-gray-800">{assessment.fashahahAssessment.sifatulHuruf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Harakat</p>
                      <p className="text-gray-800">{assessment.fashahahAssessment.harakat}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mad-Qashr</p>
                      <p className="text-gray-800">{assessment.fashahahAssessment.madQashr}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tajwid Assessment */}
              {assessment.tajwidAssessment && (
                <div className="mb-6">
                  <h3 className="mb-2 font-medium text-gray-700">
                    Penilaian Tajwid{" "}
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {assessment.tajwidAssessment.score.toFixed(2)}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hukum Nun Mati</p>
                      <p className="text-gray-800">{assessment.tajwidAssessment.hukumNunMati}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hukum Mim Mati</p>
                      <p className="text-gray-800">{assessment.tajwidAssessment.hukumMimMati}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mad</p>
                      <p className="text-gray-800">{assessment.tajwidAssessment.mad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Waqaf Ibtida'</p>
                      <p className="text-gray-800">{assessment.tajwidAssessment.waqafIbtida}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tafkhim Tarqiq</p>
                      <p className="text-gray-800">{assessment.tajwidAssessment.tafkhimTarqiq}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tartil Assessment */}
              {assessment.tartilAssessment && (
                <div className="mb-6">
                  <h3 className="mb-2 font-medium text-gray-700">
                    Penilaian Tartil{" "}
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      {assessment.tartilAssessment.score.toFixed(2)}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tempo</p>
                      <p className="text-gray-800">{assessment.tartilAssessment.tempo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ketenangan</p>
                      <p className="text-gray-800">{assessment.tartilAssessment.calmness}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kelancaran</p>
                      <p className="text-gray-800">{assessment.tartilAssessment.fluency}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Assessment */}
              {assessment.voiceAssessment && (
                <div className="mb-6">
                  <h3 className="mb-2 font-medium text-gray-700">
                    Penilaian Suara & Nada{" "}
                    <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      {assessment.voiceAssessment.score.toFixed(2)}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Suara</p>
                      <p className="text-gray-800">{assessment.voiceAssessment.voice}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nada</p>
                      <p className="text-gray-800">{assessment.voiceAssessment.tone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Adab Assessment */}
              {assessment.adabAssessment && (
                <div>
                  <h3 className="mb-2 font-medium text-gray-700">
                    Penilaian Adab & Sikap{" "}
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      {assessment.adabAssessment.score.toFixed(2)}
                    </span>
                  </h3>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adab & Sikap</p>
                    <p className="text-gray-800">{assessment.adabAssessment.attitude}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SantriLayout>
  );
}
