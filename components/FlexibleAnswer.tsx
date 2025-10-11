"use client";

type Mode = "yesno"; // single mode only

export default function FlexibleAnswer({
  id,
  label,
  value,                        // "Yes" | "No"
  onChange,                     // (mode, value) -> we'll always send ("yesno", ...)
  required = false,
  noteValue,                    // shown ONLY when value === "Yes"
  onNoteChange,                 // updates the note when typing
  notePlaceholder = "Add details...",
}: {
  id: string;
  label: string;
  value: string; // "Yes" | "No"
  onChange: (mode: Mode, value: string) => void;
  required?: boolean;

  noteValue?: string;
  onNoteChange?: (text: string) => void;
  notePlaceholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      </div>

      {/* Yes / No */}
      <div className="flex gap-4">
        {["Yes", "No"].map((v) => (
          <label key={v} className="flex items-center gap-2">
            <input
              type="radio"
              name={id}
              value={v}
              checked={value === v}
              onChange={(e) => onChange("yesno", e.target.value)}
            />
            {v}
          </label>
        ))}
      </div>

      {/* Auto note input when user chooses Yes */}
      {value === "Yes" && (
        <div className="mt-2">
          <textarea
            id={`${id}-note`}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            placeholder={notePlaceholder}
            value={noteValue ?? ""}
            onChange={(e) => onNoteChange?.(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            This field appears because you selected “Yes”.
          </p>
        </div>
      )}
    </div>
  );
}