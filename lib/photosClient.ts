// lib/photosClient.ts
export type CreatePhotoInput = {
  reportId: string;
  section: string;
  name: string;
  src?: string;
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
  figureNumber?: number;
};

export async function listPhotos(reportId: string, section?: string) {
  const url = new URL("/api/photos", window.location.origin);
  url.searchParams.set("reportId", reportId);
  if (section) url.searchParams.set("section", section);

  const r = await fetch(url, { cache: "no-store" });
  const json = await r.json();
  if (!json.ok) throw new Error(json.error || "Failed to load photos");
  return json.items as any[];
}

export async function createPhoto(input: CreatePhotoInput) {
  const r = await fetch("/api/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await r.json();
  if (!json.ok) throw new Error(json.error || "Failed to create photo");
  return json.item as any;
}

export async function updatePhoto(id: string, patch: Partial<CreatePhotoInput>) {
  const r = await fetch(`/api/photos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const json = await r.json();
  if (!json.ok) throw new Error(json.error || "Failed to update photo");
  return json.item as any;
}

export async function deletePhoto(id: string) {
  const r = await fetch(`/api/photos/${id}`, { method: "DELETE" });
  const json = await r.json();
  if (!json.ok) throw new Error(json.error || "Failed to delete photo");
  return true;
}
