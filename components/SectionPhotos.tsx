"use client";

import { useRef } from "react";
import { UPhoto } from "../lib/types";

export default function SectionPhotos({
  title = "Photos",
  photos,
  setPhotos,
  summaryToggle = false, // true if you also want the “Summary” checkbox here
}: {
  title?: string;
  photos: UPhoto[];
  setPhotos: (p: UPhoto[]) => void;
  summaryToggle?: boolean;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  const onPick = () => ref.current?.click();

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos([
          ...photos,
          {
            name: file.name,
            data: String(e.target?.result || ""),
            includeInSummary: false,
            caption: "",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (idx: number) => {
    const next = [...photos];
    next.splice(idx, 1);
    setPhotos(next);
  };

  const editCaption = (idx: number, caption: string) => {
    const next = [...photos];
    next[idx] = { ...next[idx], caption };
    setPhotos(next);
  };

  const toggleSummary = (idx: number, checked: boolean) => {
    const next = [...photos];
    next[idx] = { ...next[idx], includeInSummary: checked };
    setPhotos(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-kiwi-dark">{title}</h4>
        <div className="border-2 border-dashed border-kiwi-green rounded-lg px-3 py-1.5 text-xs">
          <button
            type="button"
            onClick={onPick}
            className="text-kiwi-green hover:underline"
          >
            + Add photos
          </button>
          <input
            ref={ref}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="text-xs text-gray-500">No photos added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p, i) => (
            <div key={`${p.name}-${i}`} className="border rounded-lg overflow-hidden">
              <img
                src={p.data}
                alt={p.name}
                className="w-full h-36 object-cover bg-gray-100"
              />
              <div className="p-2 space-y-2">
                <input
                  className="w-full text-xs px-2 py-1 border rounded"
                  placeholder="Image description (caption)…"
                  value={p.caption || ""}
                  onChange={(e) => editCaption(i, e.target.value)}
                />
                <div className="flex items-center justify-between">
                  {summaryToggle && (
                    <label className="text-xs inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!p.includeInSummary}
                        onChange={(e) => toggleSummary(i, e.target.checked)}
                      />
                      Summary
                    </label>
                  )}
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => remove(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
