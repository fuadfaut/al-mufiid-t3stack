"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
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

export default function AssessmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    studentId: "",
    surah: "",
    fromDate: "",
    toDate: "",
  });

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

    // Fetch data
    if (status === "authenticated") {
      fetchStudents();
      fetchAssessments();
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/ustadz/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    }
  };

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append("studentId", filters.studentId);
      if (filters.surah) queryParams.append("surah", filters.surah);
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);

      const response = await fetch(`/api/ustadz/assessments?${queryParams.toString()}`);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssessments();
  };

  const handleResetFilters = () => {
    setFilters({
      studentId: "",
      surah: "",
      fromDate: "",
      toDate: "",
    });
    // Fetch assessments without filters
    setTimeout(fetchAssessments, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penilaian ini?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ustadz/assessments/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete assessment");
      }
      
      // Update local state
      setAssessments((prev) => prev.filter((assessment) => assessment.id !== id));
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setError("Failed to delete assessment");
    }
  };

  const handleExportPDF = (id: string) => {
    router.push(`/ustadz/assessments/${id}/pdf`);
  };

  if (status === "loading" || (status === "authenticated" && isLoading && assessments.length === 0)) {
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
          <h1 className="text-2xl font-bold">Daftar Penilaian</h1>
          <button
            onClick={() => router.push("/ustadz/assessments/new")}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Input Penilaian Baru
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-lg font-medium">Filter Penilaian</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Santri
              </label>
              <select
                id="studentId"
                name="studentId"
                value={filters.studentId}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              >
                <option value="">Semua Santri</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.student ? `(${student.student.nis})` : ""}
                  </option>
                ))}
              </select>
            </div>

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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
            </div>

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
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
                  Santri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Surah/Jilid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nilai Akhir
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {assessment.student.name}
                      {assessment.student.student && (
                        <div className="mt-1 text-xs text-gray-500">
                          NIS: {assessment.student.student.nis} | Kelas: {assessment.student.student.class}
                        </div>
                      )}
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/ustadz/assessments/${assessment.id}`)}
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
                        <button
                          onClick={() => handleDelete(assessment.id)}
                          className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                        >
                          Hapus
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
    </UstadzLayout>
  );
}
