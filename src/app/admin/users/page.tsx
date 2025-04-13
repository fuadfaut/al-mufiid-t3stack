"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole, ApprovalStatus } from "@prisma/client";
import AdminLayout from "~/components/layouts/AdminLayout";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  student?: {
    nis: string;
    class: string;
    jilid: string;
  } | null;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    role: "ALL",
    status: "ALL",
  });

  useEffect(() => {
    // Redirect if not admin
    if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/");
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Fetch users
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "PUT",
      });
      
      if (!response.ok) {
        throw new Error("Failed to approve user");
      }
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, approvalStatus: ApprovalStatus.APPROVED }
            : user
        )
      );
    } catch (error) {
      console.error("Error approving user:", error);
      setError("Failed to approve user");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "PUT",
      });
      
      if (!response.ok) {
        throw new Error("Failed to reject user");
      }
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, approvalStatus: ApprovalStatus.REJECTED }
            : user
        )
      );
    } catch (error) {
      console.error("Error rejecting user:", error);
      setError("Failed to reject user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  // Filter users based on selected filters
  const filteredUsers = users.filter((user) => {
    const roleMatch = filter.role === "ALL" || user.role === filter.role;
    const statusMatch = filter.status === "ALL" || user.approvalStatus === filter.status;
    return roleMatch && statusMatch;
  });

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <p>Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Manajemen Pengguna</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="roleFilter" className="mr-2 text-sm font-medium">
              Role:
            </label>
            <select
              id="roleFilter"
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="ALL">Semua</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.USTADZ}>Ustadz</option>
              <option value={UserRole.SANTRI}>Santri</option>
            </select>
          </div>

          <div>
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium">
              Status:
            </label>
            <select
              id="statusFilter"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="ALL">Semua</option>
              <option value={ApprovalStatus.PENDING}>Pending</option>
              <option value={ApprovalStatus.APPROVED}>Approved</option>
              <option value={ApprovalStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data pengguna
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                      {user.role === UserRole.SANTRI && user.student && (
                        <div className="mt-1 text-xs text-gray-500">
                          NIS: {user.student.nis} | Kelas: {user.student.class} | Jilid: {user.student.jilid}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.role === UserRole.ADMIN && "Admin"}
                      {user.role === UserRole.USTADZ && "Ustadz"}
                      {user.role === UserRole.SANTRI && "Santri"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {user.approvalStatus === ApprovalStatus.PENDING && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          Pending
                        </span>
                      )}
                      {user.approvalStatus === ApprovalStatus.APPROVED && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Approved
                        </span>
                      )}
                      {user.approvalStatus === ApprovalStatus.REJECTED && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {user.approvalStatus === ApprovalStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded bg-gray-500 px-2 py-1 text-xs font-medium text-white hover:bg-gray-600"
                        >
                          Delete
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
    </AdminLayout>
  );
}
