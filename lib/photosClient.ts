export type PhotoItem = {
  _id: string;
  name: string;
  src: string;
  reportId: string;
  section: string;
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
  figureNumber?: number;
};

export async function listPhotos(reportId: string, section?: string): Promise<PhotoItem[]> {
  const q = new URLSearchParams({ reportId });
  if (section) q.set("section", section);
  const res = await fetch(`/api/photos?${q.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to list photos");
  const json = await res.json();
  return json.items as PhotoItem[];
}

export async function createPhoto(input: {
  name?: string;
  data: string; // data URL or http(s)
  reportId: string;
  section: string;
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
  figureNumber?: number;
}): Promise<PhotoItem> {
  const res = await fetch("/api/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to create photo");
  return json.item as PhotoItem;
}

export async function updatePhoto(id: string, update: {
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
  figureNumber?: number;
}): Promise<void> {
  const res = await fetch(`/api/photos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "Failed to update photo");
  }
}

export async function deletePhoto(id: string): Promise<void> {
  const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "Failed to delete photo");
  }
}

