export async function listPhotos(reportId?: string, section?: string) {
const url = new URL("/api/photos", typeof window === "undefined" ? "http://localhost" : window.location.origin);
if (reportId) url.searchParams.set("reportId", reportId);
if (section) url.searchParams.set("section", section);
const res = await fetch(url.toString(), { cache: "no-store" });
if (!res.ok) throw new Error("Failed to list photos");
return res.json();
}


export async function createPhoto(input: {
name: string;
data: string; // dataURL or http(s)
reportId?: string;
section?: string;
includeInSummary?: boolean;
caption?: string;
description?: string;
figureNumber?: number;
}) {
const res = await fetch("/api/photos", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(input),
});
if (!res.ok) throw new Error(await res.text());
return res.json();
}


export async function updatePhoto(id: string, updates: Record<string, any>) {
const res = await fetch(`/api/photos/${id}`, {
method: "PATCH",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(updates),
});
if (!res.ok) throw new Error(await res.text());
return res.json();
}


export async function deletePhoto(id: string) {
const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
if (!res.ok) throw new Error(await res.text());
return res.json();
}