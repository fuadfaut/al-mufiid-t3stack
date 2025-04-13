"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import UstadzLayout from "~/components/layouts/UstadzLayout";

export default function UstadzDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalSantri: 0,
    recentAssessments: [],
  });
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch dashboard stats
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ustadz/stats");
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
        <h1 className="mb-6 text-2xl font-bold">Dashboard Ustadz</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Assessments Card */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-green-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
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

          {/* Total Santri Card */}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Santri</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSantri}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Aksi Cepat</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/ustadz/assessments/new")}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Input Nilai Baru
              </button>
              <button
                onClick={() => router.push("/ustadz/assessments")}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Lihat Semua Nilai
              </button>
              <button
                onClick={() => router.push("/ustadz/reports")}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Buat Laporan
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Informasi Sistem</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Versi Aplikasi</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status Database</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Terakhir Diperbarui</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UstadzLayout>
  );
}
