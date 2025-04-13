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

export default function SantriAssessmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    surah: "",
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
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.surah) queryParams.append("surah", filters.surah);
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
      surah: "",
      fromDate: "",
      toDate: "",
    });
    // Fetch assessments without filters
    setTimeout(fetchAssessments, 0);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/santri/assessments/${id}`);
  };

  const handleExportPDF = (id: string) => {
    router.push(`/santri/assessments/${id}/pdf`);
  };

  if (status === "loading" || (status === "authenticated" && isLoading && assessments.length === 0)) {
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
        <h1 className="mb-6 text-2xl font-bold">Nilai Saya</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-lg font-medium">Filter Penilaian</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="surah" className="block text-sm font-medium text-gray-700">
                Surah
              </label>
              <input
                id="surah"
                name="surah"
                type="text"
                value={filters.surah}
                onChange={handleFilterChange}
                placeholder="Cari berdasarkan surah"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>

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

            <div className="flex items-end gap-2 md:col-span-3">
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

        {/* Assessments Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data penilaian
                  </td>
                </tr>
              ) : (
                assessments.map((assessment) => (
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
                      {assessment.notes && (
                        <div className="mt-1 text-xs italic text-gray-500">
                          Catatan: {assessment.notes}
                        </div>
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(assessment.id)}
                          className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleExportPDF(assessment.id)}
                          className="rounded bg-purple-500 px-2 py-1 text-xs font-medium text-white hover:bg-purple-600"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SantriLayout>
  );
}
