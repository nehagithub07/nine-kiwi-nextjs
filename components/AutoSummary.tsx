// components/AutoSummary.tsx
"use client";

import React, { useMemo } from "react";
import { UPhoto } from "@/lib/types";

type Props = { form: any; photos?: UPhoto[] };

function isNonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

function esc(s: unknown): string {
  const str = typeof s === "string" ? s : String(s ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function AutoSummary({ form, photos }: Props) {
  const sectionsHtml = useMemo(() => {
    if (!form || Object.keys(form).length === 0) return "";

    const blocks: string[] = [];

    // Report Information
    const reportBits: string[] = [];
    if (isNonEmpty(form?.status)) reportBits.push(`<p><strong>Status:</strong> ${esc(form.status)}</p>`);
    if (isNonEmpty(form?.reportId)) reportBits.push(`<p><strong>Report ID:</strong> ${esc(form.reportId)}</p>`);
    if (isNonEmpty(form?.inspectorName)) reportBits.push(`<p><strong>Inspector:</strong> ${esc(form.inspectorName)}</p>`);
    if (isNonEmpty(form?.clientName)) reportBits.push(`<p><strong>Client:</strong> ${esc(form.clientName)}</p>`);
    if (isNonEmpty(form?.inspectionDate)) reportBits.push(`<p><strong>Date:</strong> ${esc(form.inspectionDate)}</p>`);
    if (isNonEmpty(form?.location)) reportBits.push(`<p><strong>Location:</strong> ${esc(form.location)}</p>`);
    if (reportBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Report Information</h3>
          ${reportBits.join("")}
        </div>
      `);
    }

    // Weather
    const weatherBits: string[] = [];
    if (isNonEmpty(form?.temperature)) weatherBits.push(`<p><strong>Temperature:</strong> ${esc(form.temperature)}°C</p>`);
    if (isNonEmpty(form?.humidity)) weatherBits.push(`<p><strong>Humidity:</strong> ${esc(form.humidity)}%</p>`);
    if (isNonEmpty(form?.windSpeed)) weatherBits.push(`<p><strong>Wind Speed:</strong> ${esc(form.windSpeed)} m/s</p>`);
    if (isNonEmpty(form?.weatherDescription)) weatherBits.push(`<p><strong>Description:</strong> ${esc(form.weatherDescription)}</p>`);
    if (weatherBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Weather Conditions</h3>
          ${weatherBits.join("")}
        </div>
      `);
    }

    // Safety & Compliance
    const safetyBits: string[] = [];
    if (isNonEmpty(form?.safetyCompliance)) safetyBits.push(`<p><strong>Safety Compliance:</strong> ${esc(form.safetyCompliance)}</p>`);
    if (isNonEmpty(form?.safetySignage)) safetyBits.push(`<p><strong>Safety Signage:</strong> ${esc(form.safetySignage)}</p>`);
    if (safetyBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Safety & Compliance</h3>
          ${safetyBits.join("")}
        </div>
      `);
    }

    // Work Progress
    const workBits: string[] = [];
    if (isNonEmpty(form?.numWorkers)) workBits.push(`<p><strong>Workers On Site:</strong> ${esc(form.numWorkers)}</p>`);
    if (isNonEmpty(form?.workProgress)) workBits.push(`<p><strong>Work Progress:</strong> ${esc(form.workProgress)}</p>`);
    if (isNonEmpty(form?.scheduleCompliance)) workBits.push(`<p><strong>Schedule Compliance:</strong> ${esc(form.scheduleCompliance)}</p>`);
    if (workBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Work Progress</h3>
          ${workBits.join("")}
        </div>
      `);
    }

    // Equipment & Quality
    const eqBits: string[] = [];
    if (isNonEmpty(form?.equipmentCondition)) eqBits.push(`<p><strong>Equipment Condition:</strong> ${esc(form.equipmentCondition)}</p>`);
    if (isNonEmpty(form?.workmanshipQuality)) eqBits.push(`<p><strong>Workmanship Quality:</strong> ${esc(form.workmanshipQuality)}</p>`);
    if (eqBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Equipment & Quality</h3>
          ${eqBits.join("")}
        </div>
      `);
    }

    // Inspector Notes
    const notesBits: string[] = [];
    if (isNonEmpty(form?.inspectorSummary)) notesBits.push(`<p><strong>Summary:</strong> ${esc(form.inspectorSummary)}</p>`);
    if (isNonEmpty(form?.recommendations)) notesBits.push(`<p><strong>Recommendations:</strong> ${esc(form.recommendations)}</p>`);
    if (isNonEmpty(form?.additionalComments)) notesBits.push(`<p><strong>Additional Comments:</strong> ${esc(form.additionalComments)}</p>`);
    if (notesBits.length) {
      blocks.push(`
        <div class="summary-section">
          <h3 style="color:#78C850;font-weight:700;margin:16px 0 12px;">Inspector Notes</h3>
          ${notesBits.join("")}
        </div>
      `);
    }

    return blocks.join("");
  }, [form]);

  const summaryPhotos = useMemo(
    () => (Array.isArray(photos) ? photos.filter((p) => !!p?.includeInSummary) : []),
    [photos]
  );

  const hasContent = sectionsHtml.length > 0 || summaryPhotos.length > 0;

  const handleDownloadPDF = async () => {
    const { generateAutoSummaryPDF } = await import("@/lib/export");
    await generateAutoSummaryPDF(form, summaryPhotos);
  };

  const handleDownloadWord = async () => {
    const { generateAutoSummaryWord } = await import("@/lib/export");
    await generateAutoSummaryWord(form, summaryPhotos);
  };

  return (
    <div className="form-section bg-white rounded-xl p-8 shadow-lg fade-in mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-kiwi-dark flex items-center gap-3">
          <svg className="w-6 h-6 text-kiwi-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Auto Summary
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={!hasContent}
            className="btn-primary bg-kiwi-green disabled:opacity-50 disabled:cursor-not-allowed hover:bg-kiwi-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            aria-disabled={!hasContent}
            title={hasContent ? "Download PDF" : "Add some content first"}
          >
            📄 PDF
          </button>
          <button
            onClick={handleDownloadWord}
            disabled={!hasContent}
            className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            aria-disabled={!hasContent}
            title={hasContent ? "Download Word" : "Add some content first"}
          >
            📝 Word
          </button>
        </div>
      </div>

      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{
          __html:
            sectionsHtml ||
            "<p style='color:#666; font-style:italic;'>No summary data available. Fill out the form to see a preview.</p>",
        }}
        style={{ lineHeight: "1.7", fontSize: "14px", color: "#2d3748" }}
      />

      {summaryPhotos.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-kiwi-border">
          <h3 className="text-lg font-bold text-kiwi-dark mb-4">
            📷 {summaryPhotos.length} photo{summaryPhotos.length > 1 ? "s" : ""} marked for summary export
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {summaryPhotos.map((p, idx) => (
              <div key={p.name + idx} className="rounded-lg overflow-hidden border-2 border-kiwi-border shadow-sm hover:shadow-md transition-shadow">
                <img src={p.data} alt={p.caption || p.name} className="w-full h-32 object-cover" />
                <div className="p-2 bg-kiwi-light text-xs font-medium text-kiwi-dark">
                  {p.caption || p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}