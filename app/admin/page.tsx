"use client";
import { useEffect, useState } from "react";

type Stats = {
  usersCount: number;
  reportsCount: number;
  recentUsers: any[];
  recentReports: any[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load stats");
        setStats(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load stats");
      }
    })();
  }, []);

  if (error) return <div className="p-6">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-3xl font-semibold">{stats?.usersCount ?? "-"}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500">Total Reports</div>
          <div className="text-3xl font-semibold">{stats?.reportsCount ?? "-"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <a href="/admin/users" className="text-sm underline">View all</a>
          </div>
          <ul className="divide-y">
            {(stats?.recentUsers || []).map((u: any) => (
              <li key={String(u._id)} className="py-2 text-sm">
                <div className="font-medium">{u.name}</div>
                <div className="text-gray-500">{u.email} • {u.role}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            <a href="/admin/reports" className="text-sm underline">View all</a>
          </div>
          <ul className="divide-y">
            {(stats?.recentReports || []).map((r: any) => (
              <li key={String(r._id)} className="py-2 text-sm">
                <div className="font-medium">{r.reportId}</div>
                <div className="text-gray-500">User: {r.userId} • Updated: {new Date(r.updatedAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

