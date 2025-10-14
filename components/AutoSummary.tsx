"use client";
import React, { useMemo, useState } from "react";
import { UPhoto } from "@/lib/types";

type Props = { form: any; photos?: UPhoto[] };

function nonEmpty(v: any) {
  return typeof v === "string" ? v.trim().length > 0 : v != null;
}

export default function AutoSummary({ form, photos }: Props) {
  const [downloading, setDownloading] = useState<null | "pdf" | "word">(null);
  const availablePhotos = useMemo(() => (Array.isArray(photos) ? photos : []), [photos]);
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());
  // initialize selection based on includeInSummary when photos change
  React.useEffect(() => {
    const next = new Set<number>();
    availablePhotos.forEach((p, idx) => {
      if (p?.includeInSummary) next.add(idx);
    });
    setSelectedSet(next);
  }, [availablePhotos]);
  const selectedPhotos = useMemo(
    () => availablePhotos.filter((_, idx) => selectedSet.has(idx)),
    [availablePhotos, selectedSet]
  );

  const blocks = useMemo(() => {
    const out: { title: string; rows: { label: string; value: string }[] }[] = [];
    if (!form) return out;

    const info: any[] = [];
    if (nonEmpty(form?.status)) info.push({ label: "Status", value: String(form.status) });
    if (nonEmpty(form?.reportId)) info.push({ label: "Report ID", value: String(form.reportId) });
    if (nonEmpty(form?.inspectorName)) info.push({ label: "Inspector", value: String(form.inspectorName) });
    if (nonEmpty(form?.clientName)) info.push({ label: "Client", value: String(form.clientName) });
    if (nonEmpty(form?.inspectionDate)) info.push({ label: "Date", value: String(form.inspectionDate) });
    if (nonEmpty(form?.location)) info.push({ label: "Location", value: String(form.location) });
    if (info.length) out.push({ title: "Report Information", rows: info });

    const weather: any[] = [];
    if (nonEmpty(form?.temperature)) weather.push({ label: "Temperature", value: `${form.temperature}°C` });
    if (nonEmpty(form?.humidity)) weather.push({ label: "Humidity", value: `${form.humidity}%` });
    if (nonEmpty(form?.windSpeed)) weather.push({ label: "Wind", value: `${form.windSpeed} m/s` });
    if (nonEmpty(form?.weatherDescription)) weather.push({ label: "Description", value: String(form.weatherDescription) });
    if (weather.length) out.push({ title: "Weather Conditions", rows: weather });

    const safety: any[] = [];
    if (nonEmpty(form?.safetyCompliance)) safety.push({ label: "Safety Compliance", value: String(form.safetyCompliance) });
    if (nonEmpty(form?.safetySignage)) safety.push({ label: "Safety Signage", value: String(form.safetySignage) });
    if (safety.length) out.push({ title: "Safety & Compliance", rows: safety });

    const work: any[] = [];
    if (nonEmpty(form?.numWorkers)) work.push({ label: "Workers On Site", value: String(form.numWorkers) });
    if (nonEmpty(form?.workProgress)) work.push({ label: "Work Progress", value: String(form.workProgress) });
    if (nonEmpty(form?.scheduleCompliance)) work.push({ label: "Schedule", value: String(form.scheduleCompliance) });
    if (work.length) out.push({ title: "Work Progress", rows: work });

    const equip: any[] = [];
    if (nonEmpty(form?.equipmentCondition)) equip.push({ label: "Equipment Condition", value: String(form.equipmentCondition) });
    if (nonEmpty(form?.workmanshipQuality)) equip.push({ label: "Workmanship Quality", value: String(form.workmanshipQuality) });
    if (equip.length) out.push({ title: "Equipment & Quality", rows: equip });

    const notes: any[] = [];
    if (nonEmpty(form?.inspectorSummary)) notes.push({ label: "Summary", value: String(form.inspectorSummary) });
    if (nonEmpty(form?.recommendations)) notes.push({ label: "Recommendations", value: String(form.recommendations) });
    if (nonEmpty(form?.additionalComments)) notes.push({ label: "Additional Comments", value: String(form.additionalComments) });
    if (notes.length) out.push({ title: "Inspector Notes", rows: notes });

    return out;
  }, [form]);

  const hasContent = blocks.length > 0 || selectedPhotos.length > 0;

  async function download(type: "pdf" | "word") {
    setDownloading(type);
    try {
      if (type === "pdf") {
        const { generateAutoSummaryPDF } = await import("@/lib/export");
        await generateAutoSummaryPDF(form, selectedPhotos);
      } else {
        const { generateAutoSummaryWord } = await import("@/lib/export");
        await generateAutoSummaryWord(form, selectedPhotos);
      }
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="form-section bg-white rounded-xl p-6 shadow fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-kiwi-dark flex items-center gap-2">
          <svg className="w-5 h-5 text-kiwi-green" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6"/></svg>
          Auto Summary
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => download("pdf")}
            disabled={!hasContent || !!downloading}
            className="inline-flex items-center gap-2 bg-kiwi-green hover:bg-kiwi-dark text-white px-4 py-2 rounded-lg font-semibold shadow transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6"/></svg>
            {downloading === "pdf" ? "Preparing..." : "PDF"}
          </button>
          <button
            onClick={() => download("word")}
            disabled={!hasContent || !!downloading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z"/></svg>
            {downloading === "word" ? "Preparing..." : "Word"}
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No summary data available. Fill out the form to see a preview.</p>
      ) : (
        <div className="space-y-4">
          {blocks.map((b) => (
            <div key={b.title} className="rounded-lg border border-kiwi-border p-3">
              <h3 className="text-kiwi-dark font-semibold mb-2">{b.title}</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {b.rows.map((r, i) => (
                  <div key={r.label + i} className="flex items-start gap-2">
                    <dt className="text-gray-500 min-w-[140px]">{r.label}:</dt>
                    <dd className="text-gray-800">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      {availablePhotos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-kiwi-border">
          <h3 className="text-base font-semibold text-kiwi-dark mb-2">
            {selectedPhotos.length} of {availablePhotos.length} photo{availablePhotos.length > 1 ? "s" : ""} selected for summary
          </h3>
          <div className="flex items-center gap-2 mb-2 text-xs">
            <button
              type="button"
              className="px-2 py-1 rounded border hover:bg-kiwi-light"
              onClick={() => setSelectedSet(new Set(availablePhotos.map((_, i) => i)))}
            >
              Select all
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border hover:bg-kiwi-light"
              onClick={() => setSelectedSet(new Set())}
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availablePhotos.map((p, idx) => {
              const checked = selectedSet.has(idx);
              return (
                <label key={p.name + idx} className="rounded-lg overflow-hidden border border-kiwi-border shadow-sm cursor-pointer select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.data} alt={p.caption || p.name} className="w-full h-28 object-cover" />
                  <div className="flex items-center justify-between p-2 bg-kiwi-light text-xs font-medium text-kiwi-dark gap-2">
                    <span className="truncate">{p.caption || p.name}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedSet((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(idx); else next.delete(idx);
                          return next;
                        });
                      }}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
