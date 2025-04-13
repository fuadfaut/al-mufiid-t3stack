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
  finalScore: number | null;
  createdBy: {
    name: string | null;
  };
};

export default function SantriDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    recentAssessments: [] as Assessment[],
  });
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch dashboard stats
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/santri/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
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
        <h1 className="mb-6 text-2xl font-bold">Dashboard Santri</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Assessments Card */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-purple-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Penilaian</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalAssessments}</p>
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.averageScore.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Terbaru</h2>
          
          {stats.recentAssessments.length === 0 ? (
            <p className="text-gray-500">Belum ada penilaian</p>
          ) : (
            <div className="overflow-x-auto">
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
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ustadz/Ustadzah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stats.recentAssessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(assessment.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assessment.surah || assessment.jilid || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
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
          
          {stats.recentAssessments.length > 0 && (
            <div className="mt-4 text-right">
              <button
                onClick={() => router.push("/santri/assessments")}
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Lihat Semua Nilai →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/santri/assessments")}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Lihat Semua Nilai
            </button>
            <button
              onClick={() => router.push("/santri/report")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Unduh Rapor
            </button>
          </div>
        </div>
      </div>
    </SantriLayout>
  );
}
