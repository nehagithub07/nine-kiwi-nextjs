"use client";
import { useEffect, useMemo, useState } from "react";
import { generateFullReportPDF } from "@/lib/export";

type ReportItem = {
  _id: string;
  userId: string;
  reportId: string;
  status?: string;
  updatedAt?: string;
  user?: { _id: string; name: string; email: string; role: string } | null;
  data?: any;
  signatureData?: string | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [photosOpen, setPhotosOpen] = useState<null | { reportId: string; items: any[] }>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/reports`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load reports");
        setReports(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load reports");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return reports;
    const s = q.toLowerCase();
    return reports.filter((r) =>
      r.reportId?.toLowerCase().includes(s) ||
      r.user?.email?.toLowerCase().includes(s) ||
      r.user?.name?.toLowerCase().includes(s)
    );
  }, [q, reports]);

  if (error) return <div className="p-6">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="mb-4">
        <input
          className="border rounded px-3 py-2 w-full sm:w-80"
          placeholder="Search by report ID or user"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Report ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Updated</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={String(r._id)} className="border-t">
                <td className="p-2">{r.reportId}</td>
                <td className="p-2">{r.user?.name || r.userId}</td>
                <td className="p-2">{r.user?.email || ""}</td>
                <td className="p-2">{r.status || ""}</td>
                <td className="p-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ""}</td>
                <td className="p-2">
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-60"
                    disabled={downloading === r.reportId}
                    onClick={async () => {
                      setDownloading(r.reportId);
                      try {
                        const form = r.data || {};
                        const signatureData = r.signatureData || null;
                        // fetch all photos for this report
                        const resp = await fetch(`/api/photos?reportId=${encodeURIComponent(r.reportId)}`, { cache: "no-store" });
                        const j = await resp.json();
                        const items: any[] = j?.items || [];
                        // build exporter buckets
                        const buckets: Record<string, any[]> = {
                          background: [],
                          fieldObservation: [],
                          work: [],
                          safety: [],
                          equipment: [],
                          additional: [],
                        };
                        const toPhoto = (it: any) => ({
                          name: it.name || "Photo",
                          data: it.src || "",
                          includeInSummary: !!it.includeInSummary,
                          caption: it.caption || "",
                          description: it.description || "",
                          figureNumber: typeof it.figureNumber === "number" ? it.figureNumber : undefined,
                        });
                        for (const it of items) {
                          const sec = String(it.section || "additional");
                          if (sec in buckets) buckets[sec].push(toPhoto(it));
                          else buckets.additional.push(toPhoto(it));
                        }
                        await generateFullReportPDF(form, buckets as any, signatureData);
                      } catch (e) {
                        alert("Failed to generate PDF. See console.");
                        console.error(e);
                      } finally {
                        setDownloading(null);
                      }
                    }}
                  >
                    {downloading === r.reportId ? "Generating..." : "Download PDF"}
                  </button>
                  <button
                    className="ml-2 px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={async () => {
                      try {
                        const resp = await fetch(`/api/photos?reportId=${encodeURIComponent(r.reportId)}`, { cache: "no-store" });
                        const j = await resp.json();
                        setPhotosOpen({ reportId: r.reportId, items: j?.items || [] });
                      } catch (e) {
                        alert("Failed to load photos");
                      }
                    }}
                  >
                    View Photos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {photosOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center" onClick={() => setPhotosOpen(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Photos for {photosOpen.reportId}</div>
              <button className="px-3 py-1 border rounded" onClick={() => setPhotosOpen(null)}>Close</button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photosOpen.items.map((p: any) => (
                <div key={String(p._id)} className="border rounded overflow-hidden">
                  <img src={p.src} alt={p.name || "Photo"} className="w-full h-48 object-cover" />
                  <div className="p-2 text-sm">
                    <div className="font-medium truncate">{p.caption || p.name || "Photo"}</div>
                    <div className="text-gray-500">Section: {p.section}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
