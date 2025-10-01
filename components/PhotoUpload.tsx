"use client";

import React, { Dispatch, SetStateAction } from "react";

export type UPhoto = {
  name: string;
  data: string;
  includeInSummary: boolean;
  caption?: string; // user-entered description
};

type Props = {
  photos: UPhoto[];
  setPhotos: Dispatch<SetStateAction<UPhoto[]>>; // <-- React state setter type
};

export default function PhotoUpload({ photos, setPhotos }: Props) {
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);

    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: UPhoto = {
          name: file.name,
          data: String(e.target?.result || ""),
          includeInSummary: false,
          caption: "", // init empty caption
        };
        // immutable append (functional updater is now correctly typed)
        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSummary = (i: number, checked: boolean) => {
    setPhotos((prev) =>
      prev.map((ph, idx) => (idx === i ? { ...ph, includeInSummary: checked } : ph))
    );
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCaption = (i: number, value: string) => {
    setPhotos((prev) => prev.map((ph, idx) => (idx === i ? { ...ph, caption: value } : ph)));
  };

  // drag & drop helpers
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-kiwi-green"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2" />
        </svg>
        Photo Evidence
      </h2>

      <div
        className="border-2 border-dashed border-kiwi-green rounded-lg p-6 text-center cursor-pointer"
        onClick={() => document.getElementById("photoUpload")?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <input
          id="photoUpload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="text-kiwi-green mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6"
            />
          </svg>
        </div>
        <p className="mb-2">Click to upload or drag & drop photos</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById("photoUpload")?.click();
          }}
          className="bg-kiwi-green text-white px-4 py-2 rounded-lg hover:bg-kiwi-dark transition"
        >
          Choose Photos
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Tick “Summary” to include an image in the summary exports. Add your own description under
          each photo.
        </p>
      </div>

      {/* Grid of photos (unchanged look) + caption input below each card */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((p, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.data} alt={p.name} className="w-full h-32 object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-2 flex items-center justify-between">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={p.includeInSummary}
                    onChange={(e) => toggleSummary(i, e.target.checked)}
                  />
                  <span>Summary</span>
                </label>
                <button onClick={() => removePhoto(i)} className="px-2 py-0.5 bg-red-500 rounded">
                  Remove
                </button>
              </div>
            </div>

            {/* caption/description input */}
            <div className="p-3 border-t">
              <label className="block text-xs text-gray-600 mb-1" htmlFor={`cap-${i}`}>
                Image description (optional)
              </label>
              <input
                id={`cap-${i}`}
                type="text"
                placeholder="Describe what this photo shows…"
                value={p.caption || ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                className="w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-kiwi-green"
              />
              <div className="mt-1 text-[11px] text-gray-500 truncate">
                <strong>File:</strong> {p.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
