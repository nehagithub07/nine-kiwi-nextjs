/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { jsPDF as JsPDFType } from "jspdf";

/* =========================
   TYPES
   ========================= */
export interface PhotoData {
  name: string;
  data: string;                  // dataURL or http(s)
  includeInSummary?: boolean;
  caption?: string;
  figureNumber?: number;
  description?: string;
}

interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface WeatherData {
  temperature?: string | number;
  humidity?: string | number;
  windSpeed?: string | number;
  weatherDescription?: string;
}

export interface FormData extends WeatherData {
  // identity & contact
  companyName?: string;            // used on cover + disclaimer
  nameandAddressOfCompany?: string;
  contactPhone?: string;
  contactEmail?: string;

  // meta
  status?: string;
  reportId?: string;
  inspectionDate?: string;         // YYYY-MM-DD
  startInspectionTime?: string;    // HH:mm (not shown in header)
  inspectorName?: string;
  supervisorName?: string;         // optional; tolerated if present
  clientName?: string;

  // location (address pieces)
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  address?: AddressData;

  // coords
  lat?: string | number;
  lon?: string | number;

  // narrative / notes
  workProgress?: string;
  safetyCompliance?: string;
  safetySignage?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;

  additionalComments?: string;
  inspectorSummary?: string;
  recommendations?: string;

  // signatures
  signatureData?: string;          // base64 dataURL
}

/* =========================
   VERY SIMPLE (B/W) CSS
   ========================= */
const PLAIN_CSS = `
@page { size: A4; margin: 0; }
.nk-root, .nk-root * {
  box-sizing: border-box !important;
  color: #000 !important;
  font-family: Arial, Helvetica, sans-serif !important;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.nk-page { width: 210mm; min-height: 297mm; padding: 14mm; page-break-after: always; background: #fff; }
.nk-page:last-child { page-break-after: auto; }

/* header (small, no time) */
.nk-header { margin-bottom: 8mm; }
.nk-head-line { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 0; font-size: 11pt; font-weight: 700; text-align: center; }

/* titles */
.nk-title { font-size: 18pt; font-weight: 700; text-align: center; margin: 28mm 0 4mm 0; }
.nk-subtitle { font-size: 12pt; font-weight: 700; text-align: center; margin: 2mm 0 18mm 0; }

/* blocks */
.nk-block-title { font-size: 12pt; font-weight: 700; margin: 6mm 0 2mm 0; }
.nk-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
.nk-table th, .nk-table td { border: 1px solid #000; padding: 6px; vertical-align: top; }
.nk-table th { font-weight: 700; background: #fff; }
.nk-p { font-size: 10.5pt; line-height: 1.55; text-align: justify; }

/* photo layout: 2 per page max; each card vertically stacked */
.nk-photo-grid { display: grid; grid-template-columns: 1fr; gap: 8mm; }
.nk-photo-card { border: 1px solid #000; padding: 5mm; }
.nk-photo-img-wrap { border: 1px solid #000; padding: 2mm; background: #fff; }
.nk-photo-img { display:block !important; width:100%; max-height: 95mm; object-fit: contain; background:#fff; }
.nk-caption { margin-top: 3mm; font-size: 10pt; font-weight: 700; }
.nk-desc { margin-top: 1mm; font-size: 9.5pt; }

/* signature */
.nk-sign { margin-top: 8mm; border: 1px solid #000; padding: 5mm; display:flex; align-items:center; gap:10mm; }
.nk-sign img { max-width: 60mm; max-height: 25mm; object-fit: contain; }
`;

/* =========================
   HELPERS
   ========================= */
const S = (v: unknown) => (v == null ? "" : String(v).trim());

const joinAddress = (form: FormData): string => {
  const parts = [
    form.streetAddress,
    [form.city, form.state].filter(Boolean).join(", "),
    [form.country, form.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map(S)
    .filter(Boolean);
  return parts.join(", ");
};

const headerLine = (form: FormData): string => {
  const label = "FIELD INSPECTION / CONSTRUCTION PROGRESS";
  const addr = joinAddress(form) || S(form.location);
  const date = form.inspectionDate
    ? new Date(form.inspectionDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const right = [addr, date].filter(Boolean).join(" — ");
  return `<div class="nk-head-line">${label}${right ? ` — ${right}` : ""}</div>`;
};

function mount(html: string): () => void {
  const root = document.createElement("div");
  root.className = "nk-root";
  const style = document.createElement("style");
  style.textContent = PLAIN_CSS;
  root.appendChild(style);
  const slot = document.createElement("div");
  slot.innerHTML = html;
  root.appendChild(slot);
  document.body.appendChild(root);
  return () => root.parentNode?.removeChild(root);
}

// robust fetch → dataURL, swallow CORS/403 and return ""
async function toDataURL(resp: Response): Promise<string> {
  if (!resp.ok) throw new Error(String(resp.status));
  const blob = await resp.blob();
  return await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
async function fetchToDataURL(url: string): Promise<string> {
  try {
    if (!url || url.startsWith("data:")) return url;
    // try same-origin proxy first
    const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    return await toDataURL(await fetch(proxied, { cache: "no-store" }));
  } catch {}
  try {
    // weserv (strip scheme)
    const ws = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ""))}`;
    return await toDataURL(await fetch(ws, { mode: "cors", cache: "no-cache" }));
  } catch {}
  try {
    const cp = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    return await toDataURL(await fetch(cp, { mode: "cors", cache: "no-cache" }));
  } catch {}
  console.warn("Image fetch failed for:", url);
  return "";
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>(async (resolve) => {
          // fill remote src via data-image-src (we do this before waiting)
          const dataSrc = img.getAttribute("data-image-src");
          if (dataSrc) {
            const data = await fetchToDataURL(dataSrc);
            if (data) img.src = data;
            img.removeAttribute("data-image-src");
          }
          if (img.complete && img.naturalHeight > 0) return resolve();
          const done = () => resolve();
          const to = setTimeout(done, 20000);
          img.onload = () => { clearTimeout(to); resolve(); };
          img.onerror = () => { clearTimeout(to); resolve(); };
        })
    )
  );
}

async function renderNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  return await html2canvas(node, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: false,
    imageTimeout: 30000,
    logging: false,
    windowWidth: Math.max(node.scrollWidth, node.clientWidth),
    windowHeight: Math.max(node.scrollHeight, node.clientHeight),
  } as any);
}
function canvasToImg(canvas: HTMLCanvasElement): { data: string; type: "PNG" | "JPEG" } {
  try {
    const png = canvas.toDataURL("image/png", 1.0);
    if (png.startsWith("data:image/png")) return { data: png, type: "PNG" };
  } catch {}
  return { data: canvas.toDataURL("image/jpeg", 0.98), type: "JPEG" };
}

/* =========================
   CONTENT BUILDERS
   ========================= */
function coverPage(form: FormData): string {
  // company from user
  const comp = S(form.companyName) || "INSPECTION COMPANY";
  const addrText =
    S(form.nameandAddressOfCompany) ||
    [S(form.streetAddress), S(form.city), S(form.state), S(form.zipCode)]
      .filter(Boolean)
      .join(", ") ||
    "";

  const loc = joinAddress(form) || S(form.location) || "PROJECT LOCATION";
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `
  <div class="nk-page">
    <div class="nk-header">${headerLine(form)}</div>
    <div class="nk-title">NINEKIWI INSPECTION REPORT</div>
    <div class="nk-subtitle">${loc}</div>

    <div class="nk-block" style="margin-top: 25mm;">
      <div class="nk-p"><b>${comp}</b><br/>${addrText}</div>
    </div>

    <div class="nk-block" style="margin-top: 25mm;">
      <div class="nk-p"><b>REPORT DATE</b> ${today}</div>
    </div>

    <div class="nk-block" style="margin-top: 25mm;">
      <div class="nk-p"><b>Prepared for:</b> ${S(form.clientName) || "Owner"}</div>
      <div class="nk-p" style="margin-top: 5mm;"><b>Prepared by:</b> ${S(form.inspectorName) || "Inspector"}</div>
    </div>
  </div>`;
}

function disclaimerPage(form: FormData): string {
  const comp = S(form.companyName) || "INSPECTION COMPANY";
  return `
  <div class="nk-page">
    <div class="nk-header">${headerLine(form)}</div>
    <div class="nk-block-title">Disclaimer</div>
    <p class="nk-p">
      This Report is intended solely for use by the Client in accordance with <b>${comp}</b> contract with the
      Client. While the Report may be provided to applicable authorities having jurisdiction and others for whom
      the Client is responsible, <b>${comp}</b> does not warrant the services to any third party. The report may not
      be relied upon by any other party without the express written consent of <b>${comp}</b>, which may be withheld
      at <b>${comp}</b> discretion.
    </p>
  </div>`;
}

function tocBlock(items: string[], form: FormData): string {
  const rows = items
    .map((t, i) => `<tr><td style="width:12mm; text-align:right;"><b>${i + 1}.</b></td><td>${t}</td></tr>`)
    .join("");
  return `
  <div class="nk-page">
    <div class="nk-header">${headerLine(form)}</div>
    <div class="nk-block-title">Table of Contents</div>
    <table class="nk-table"><tbody>${rows}</tbody></table>
  </div>`;
}

function autoBackground(form: FormData): string {
  const bits: string[] = [];
  if (S(form.scheduleCompliance)) bits.push(`Schedule: ${S(form.scheduleCompliance)}.`);
  if (S(form.materialAvailability)) bits.push(`Materials: ${S(form.materialAvailability)}.`);
  if (S(form.safetyCompliance)) bits.push(`Safety Compliance: ${S(form.safetyCompliance)}.`);
  if (S(form.safetySignage)) bits.push(`Safety Signage: ${S(form.safetySignage)}.`);
  if (S(form.workProgress)) bits.push(`Work Progress: ${S(form.workProgress)}.`);

  if (!bits.length) {
    bits.push(
      "This inspection captures current site conditions, safety conformance, schedule position, " +
        "and available resources as observed during the visit."
    );
  }
  return `<p class="nk-p">${bits.join(" ")}</p>`;
}

function autoConclusion(form: FormData): string {
  const parts: string[] = [];
  if (S(form.status)) parts.push(`Overall status is <b>${S(form.status)}</b>.`);
  if (S(form.scheduleCompliance)) parts.push(`Schedule alignment is <b>${S(form.scheduleCompliance)}</b>.`);
  if (S(form.materialAvailability)) parts.push(`Material availability is <b>${S(form.materialAvailability)}</b>.`);
  if (S(form.safetyCompliance)) parts.push(`Safety compliance is <b>${S(form.safetyCompliance)}</b>.`);

  const summary =
    parts.length > 0
      ? parts.join(" ")
      : "No critical blockers observed. Continue monitoring schedule, safety adherence, and resource availability.";
  const notes = S(form.additionalComments);

  return `
  <p class="nk-p">${summary}</p>
  ${notes ? `<p class="nk-p"><b>Notes & Recommendations:</b> ${notes}</p>` : ""}
  ${S(form.inspectorSummary) ? `<p class="nk-p"><b>Inspector’s Summary:</b> ${S(form.inspectorSummary)}</p>` : ""}
  ${S(form.recommendations) ? `<p class="nk-p"><b>Recommended Actions:</b> ${S(form.recommendations)}</p>` : ""}`;
}

/* chunk array into groups of size n (for 2 images per page) */
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function obsTable(form: FormData): string {
  const rows: string[] = [];

  const addr = joinAddress(form) || S(form.location);
  const weatherBits: string[] = [];
  if (S(form.temperature)) weatherBits.push(`${S(form.temperature)}°C`);
  if (S(form.weatherDescription)) weatherBits.push(S(form.weatherDescription));
  if (S(form.humidity)) weatherBits.push(`Humidity ${S(form.humidity)}%`);
  if (S(form.windSpeed)) weatherBits.push(`Wind ${S(form.windSpeed)} m/s`);

  const addRow = (label: string, val?: string) => {
    if (S(val)) rows.push(`<tr><td><b>${label}</b></td><td>${S(val)}</td></tr>`);
  };

  addRow("Status", S(form.status));
  addRow("Report ID", S(form.reportId));
  addRow("Inspector", S(form.inspectorName));
  addRow("Inspection Date", S(form.inspectionDate));
  addRow("Address", addr);
  if (weatherBits.length) addRow("Weather Conditions", weatherBits.join(" | "));

  return `<table class="nk-table"><thead><tr><th style="width:38%;">Field</th><th>Details</th></tr></thead><tbody>${rows.join(
    ""
  )}</tbody></table>`;
}

/* one photo card */
function photoCard(p: PhotoData, fig: number): string {
  const isRemote = p.data && p.data.startsWith("http");
  const srcAttr = isRemote ? `data-image-src="${p.data}" src=""` : `src="${p.data}"`;
  const cap = S(p.caption || p.name) || `Photo ${fig}`;
  const desc = S(p.description);
  return `
  <div class="nk-photo-card">
    <div class="nk-photo-img-wrap">
      <img class="nk-photo-img" ${srcAttr} alt="${cap}" loading="eager" />
    </div>
    <div class="nk-caption">Figure ${fig}. ${cap}</div>
    ${desc ? `<div class="nk-desc">${desc}</div>` : ""}
  </div>`;
}

/* Build the 4 sections body */
function buildBodyHTML(
  form: FormData,
  backgroundHTML: string,
  photos: PhotoData[]
): string {
  const h = (f: FormData) => `<div class="nk-header">${headerLine(f)}</div>`;

  const page1 = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">1. Site location and Field Condition Summary</div>
    ${obsTable(form)}
  </div>`;

  const page2 = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">2. Background</div>
    ${backgroundHTML}
  </div>`;

  // Field Observation text block
  const obsTextParts: string[] = [];
  if (S(form.scheduleCompliance)) obsTextParts.push(`<p class="nk-p"><b>Progress vs schedule:</b> ${S(form.scheduleCompliance)}</p>`);
  if (S(form.materialAvailability)) obsTextParts.push(`<p class="nk-p"><b>Materials available & usable:</b> ${S(form.materialAvailability)}</p>`);
  if (S(form.safetyCompliance)) obsTextParts.push(`<p class="nk-p"><b>Safety protocols & PPE:</b> ${S(form.safetyCompliance)}</p>`);
  if (S(form.safetySignage)) obsTextParts.push(`<p class="nk-p"><b>Safety signage & access control:</b> ${S(form.safetySignage)}</p>`);
  if (S(form.workProgress)) obsTextParts.push(`<p class="nk-p"><b>Current work progress:</b> ${S(form.workProgress)}</p>`);

  const photoChunks = chunk(photos, 2);
  const photoPages = photoChunks
    .map((group, gi) => {
      const figOffset = gi * 2;
      return `
      <div class="nk-page">
        ${h(form)}
        <div class="nk-block-title">${gi === 0 ? "3. Field Observation" : "3. Field Observation (cont.)"}</div>
        ${gi === 0 && obsTextParts.length ? obsTextParts.join("") : ""}
        <div class="nk-photo-grid">
          ${group.map((p, i) => photoCard(p, figOffset + i + 1)).join("")}
        </div>
      </div>`;
    })
    .join("");

  const fallbackObservation =
    photos.length === 0
      ? `
      <div class="nk-page">
        ${h(form)}
        <div class="nk-block-title">3. Field Observation</div>
        ${obsTextParts.length ? obsTextParts.join("") : `<p class="nk-p">No photos were attached.</p>`}
      </div>`
      : "";

  const sign = form.signatureData
    ? `<div class="nk-sign"><img src="${form.signatureData}" alt="Signature" /><div><div><b>Inspector:</b> ${S(
        form.inspectorName
      ) || "—"}</div></div></div>`
    : "";

  const pageLast = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">4. Conclusion</div>
    ${autoConclusion(form)}
    ${sign}
  </div>`;

  return page1 + page2 + (photoPages || fallbackObservation) + pageLast;
}

/* =========================
   RENDER → PDF
   ========================= */
async function renderRootToPDF(root: HTMLElement, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf: JsPDFType = new jsPDF("p", "mm", "a4");

  await waitForImages(root);

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"));
  const pageWidth = pdf.internal.pageSize.getWidth();   // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i]);
    const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgW = canvas.width * scale;
    const imgH = canvas.height * scale;
    const x = (pageWidth - imgW) / 2;
    const y = 0;

    if (i > 0) pdf.addPage();
    const { data, type } = canvasToImg(canvas);
    pdf.addImage(data, type, x, y, imgW, imgH, undefined, "FAST");
  }

  pdf.save(filename);
}

/* =========================
   PUBLIC API
   ========================= */

/** Build the full (cover + disclaimer + TOC + 4 sections) and export to PDF */
export async function generateFullReportPDF(
  form: FormData,
  sectionPhotos: Record<string, PhotoData[]>,
  signatureData: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const toc = [
    "Site location and Field Condition Summary",
    "Background",
    "Field Observation",
    "Conclusion",
  ];

  // flatten photos in a deterministic order
  const order = ["work", "equipment", "safety", "weather", "quality", "incidents", "notes", "evidence", "additional"];
  const photos: PhotoData[] = [];
  for (const key of order) {
    for (const p of sectionPhotos?.[key] || []) {
      if (p && (p.data || p.name)) photos.push(p);
    }
  }

  const bg = autoBackground(form);
  const formPlus = signatureData ? { ...form, signatureData } : form;

  const html =
    coverPage(formPlus) +
    disclaimerPage(formPlus) +
    tocBlock(toc, formPlus) +
    buildBodyHTML(formPlus, bg, photos);

  const cleanup = mount(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const nameBase =
      (S(formPlus.reportId) || S(formPlus.clientName) || S(formPlus.location) || "report")
        .replace(/[^\w.-]+/g, "_") || "report";
    await renderRootToPDF(root, `ninekiwi_report_${nameBase}_${dateStr}.pdf`);
  } catch (e) {
    console.error("PDF generation failed:", e);
    alert("PDF generation failed. Please try again.");
  } finally {
    cleanup();
  }
}

/** Summary PDF (kept for compatibility). Hide its button if you don’t want it in UI. */
export async function generateSummaryPDF(
  form: FormData,
  summaryPhotos: PhotoData[],
  additionalPhotos: PhotoData[] = [],
  signatureData?: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const toc = [
    "Site location and Field Condition Summary",
    "Background",
    "Field Observation",
    "Conclusion",
  ];

  const photos = [...summaryPhotos, ...additionalPhotos];
  const bg = autoBackground(form);
  const formPlus = signatureData ? { ...form, signatureData } : form;

  const html =
    coverPage(formPlus) +
    disclaimerPage(formPlus) +
    tocBlock(toc, formPlus) +
    buildBodyHTML(formPlus, bg, photos);

  const cleanup = mount(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const nameBase =
      (S(formPlus.reportId) || S(formPlus.clientName) || S(formPlus.location) || "summary")
        .replace(/[^\w.-]+/g, "_") || "summary";
    await renderRootToPDF(root, `ninekiwi_summary_${nameBase}_${dateStr}.pdf`);
  } catch (e) {
    console.error("Summary PDF generation failed:", e);
    alert("Summary PDF generation failed. Please try again.");
  } finally {
    cleanup();
  }
}

export async function generateSummaryWord(_form: FormData, _summaryPhotos: PhotoData[]): Promise<void> {
  alert("Word export will be plain black & white and is coming soon. Please use PDF for now.");
}
