"use client";
import React, { useMemo } from "react";

export default function AutoSummary({ form }: { form: any }) {
  const summary = useMemo(() => {
    const good = (form?.positives || "").trim();
    const critical = (form?.issues || "").trim();
    const recs = (form?.recommendations || "").trim();

    const w = Number(form?.weatherScore ?? 0);
    const weatherNote =
      w <= 2
        ? `<div class="text-sm text-kiwi-gray italic">🌤️ Adverse weather impacted productivity.</div>`
        : w >= 4
        ? `<div class="text-sm text-kiwi-gray italic">🌤️ Favorable weather supported progress.</div>`
        : "";

    const rows = [
      good && `<li><strong>Positive Highlights:</strong> ${good}</li>`,
      critical && `<li><strong>Critical Issues:</strong> ${critical}</li>`,
      recs && `<li><strong>Next Actions:</strong> ${recs}</li>`,
    ]
      .filter(Boolean)
      .join("");

    if (!rows) {
      return `<p class="text-kiwi-gray">Provide details to generate a human summary.</p>`;
    }

    return `
      ${weatherNote}
      <ul class="list-disc ml-5 space-y-1">${rows}</ul>
    `;
  }, [form]);

  return <div id="autoSummary" dangerouslySetInnerHTML={{ __html: summary }} />;
}
