"use client";

type Mode = "yesno" | "text";

export default function FlexibleAnswer({
  id,
  label,
  mode,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  mode: Mode;
  value: string;                       // "Yes"/"No" or free text
  onChange: (mode: Mode, value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name={`mode_${id}`}
              value="yesno"
              checked={mode === "yesno"}
              onChange={() => onChange("yesno", "")}
            />
            Yes/No
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name={`mode_${id}`}
              value="text"
              checked={mode === "text"}
              onChange={() => onChange("text", "")}
            />
            Text
          </label>
        </div>
      </div>

      {mode === "yesno" ? (
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
      ) : (
        <textarea
          id={id}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
          placeholder="Write a short note…"
          value={value}
          onChange={(e) => onChange("text", e.target.value)}
        />
      )}
    </div>
  );
}
