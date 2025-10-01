"use client";
import React, { useCallback, useRef, useState } from "react";

export type UPhoto = {
  name: string;
  data: string; // data URL
  includeInSummary?: boolean;
  caption?: string;
  figureNumber?: number;
  description?: string;
};

type Props = {
  title: string;
  photos: UPhoto[];
  setPhotos: (p: UPhoto[]) => void;
  summaryToggle?: boolean;
};

export default function SectionPhotos({ title, photos, setPhotos, summaryToggle }: Props) {
  // Guard: photos might briefly be non-array if caller mistakenly passed something else
  const safePhotos: UPhoto[] = Array.isArray(photos) ? photos : [];
  const [counter, setCounter] = useState<number>(safePhotos.length);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // assign figure numbers after any change
  const renumber = useCallback((arr: UPhoto[]) => {
    return arr.map((p, i) => ({ ...p, figureNumber: i + 1 }));
  }, []);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files.length) return;
      const readers: Promise<UPhoto>[] = Array.from(files).map((file) => {
        return new Promise((res) => {
          const r = new FileReader();
          r.onload = () =>
            res({
              name: file.name,
              data: String(r.result || ""),
            });
          r.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((arr) => {
        const next = renumber([...(safePhotos || []), ...arr]);
        setPhotos(next);
        setCounter(next.length);
      });
    },
    [safePhotos, renumber, setPhotos]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // reset input so same file can be selected again
    e.currentTarget.value = "";
  };

  const handleCaptureFromCamera = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      // @ts-ignore
      input.capture = "environment";
      input.onchange = (ev: any) => addFiles(ev.target.files);
      input.click();
    } catch {
      // fallback to normal file picker
      fileRef.current?.click();
    }
  };

  const removeAt = (idx: number) => {
    const next = renumber((safePhotos || []).filter((_, i) => i !== idx));
    setPhotos(next);
    setCounter(next.length);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary px-3 py-2 text-sm"
            onClick={() => fileRef.current?.click()}
          >
            Add photo
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-lg border text-kiwi-dark hover:bg-kiwi-light"
            onClick={handleCaptureFromCamera}
          >
            Take photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>

      {/* grid */}
      <div className="photo-grid">
        {(safePhotos || []).map((p, idx) => (
          <div key={idx} className="photo-item p-3 bg-white border rounded-lg">
            <img
              src={p.data}
              alt={p.name || `photo_${idx + 1}`}
              className="w-full h-40 object-cover rounded-md"
            />

            <div className="mt-2 text-sm font-semibold">
              Figure {p.figureNumber ?? idx + 1}
            </div>

            <div className="mt-2">
              <label className="block text-xs mb-1">Caption</label>
              <input
                className="w-full px-2 py-1 border rounded"
                defaultValue={p.caption || ""}
                onBlur={(e) => {
                  const val = e.currentTarget.value ?? "";
                  const next = Array.isArray(safePhotos) ? [...safePhotos] : [];
                  if (!next[idx]) return;
                  next[idx] = { ...next[idx], caption: val };
                  setPhotos(renumber(next));
                  setCounter(next.length);
                }}
              />
            </div>

            <div className="mt-2">
              <label className="block text-xs mb-1">Description</label>
              <textarea
                rows={2}
                className="w-full px-2 py-1 border rounded"
                defaultValue={p.description || ""}
                onBlur={(e) => {
                  const val = e.currentTarget.value ?? "";
                  const next = Array.isArray(safePhotos) ? [...safePhotos] : [];
                  if (!next[idx]) return;
                  next[idx] = { ...next[idx], description: val };
                  setPhotos(renumber(next));
                  setCounter(next.length);
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              {summaryToggle ? (
                <label className="text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={!!p.includeInSummary}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked;
                      const next = Array.isArray(safePhotos) ? [...safePhotos] : [];
                      if (!next[idx]) return;
                      next[idx] = { ...next[idx], includeInSummary: checked };
                      setPhotos(renumber(next));
                      setCounter(next.length);
                    }}
                  />
                  Include in summary
                </label>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="text-red-600 text-sm"
                onClick={() => removeAt(idx)}
                aria-label={`Remove photo ${idx + 1}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-2">Total images: {counter}</div>
    </div>
  );
}
