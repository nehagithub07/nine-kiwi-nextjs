// eslint-disable @typescript-eslint/no-explicit-any
"use client";

import type { jsPDF as JsPDFType } from "jspdf";

export interface PhotoData {
  name: string;
  data: string;                  // dataURL or http(s)
  includeInSummary?: boolean;
  caption?: string;
  figureNumber?: number;
  description?: string;
}

interface WeatherData {
  temperature?: string | number;
  humidity?: string | number;
  windSpeed?: string | number;
  weatherDescription?: string;
}

export interface FormData extends WeatherData {
  // identity & contact
  companyName?: string;
  nameandAddressOfCompany?: string;
  contactPhone?: string;
  contactEmail?: string;

  // meta
  status?: "In Progress" | "Completed" | "On Track" | "";
  reportId?: string;
  inspectionDate?: string;         // YYYY-MM-DD
  startInspectionTime?: string;    // HH:mm
  inspectorName?: string;
  clientName?: string;

  // location
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  // coords
  lat?: string | number;
  lon?: string | number;

  // narrative
  workProgress?: string;
  safetyCompliance?: string;
  safetySignage?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;
  workerAttendance?: string;

  additionalComments?: string;
  inspectorSummary?: string;
  recommendations?: string;

  // NEW: background + field obs user text
  backgroundManual?: string;
  backgroundAuto?: string;
  fieldObservationText?: string;

  // signature
  signatureData?: string;
}
 
const THEME_CSS = `
@page { size: A4; margin: 0; }
.nk-root, .nk-root * {
  box-sizing: border-box !important;
  color: #111 !important;
  font-family: Inter, Arial, Helvetica, sans-serif !important;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.nk-page { width: 210mm; min-height: 297mm; padding: 16mm 16mm 18mm 16mm; page-break-after: always; background: #fff; position: relative; }
.nk-page:last-child { page-break-after: auto; }

/* Header */
.nk-header { margin: 0 0 10mm 0; }
.nk-head-title { text-align:center; font-size:10.75pt; font-weight:800; }
.nk-head-rule  { height:0; border-bottom: 2px solid #1e40af; margin-top:4px; }

/* Footer (page number centered) */
.nk-footer {
  position: absolute; left: 16mm; right: 16mm; bottom: 10mm;
  display: flex; justify-content: center; align-items: center;
  font-size: 10pt; font-weight: 700;
}

/* Titles */
.nk-block-title { font-size: 12.5pt; font-weight: 800; margin: 6mm 0 3mm 0; text-align:center; }
.nk-p { font-size: 10.75pt; line-height: 1.55; text-align: justify; }
.nk-meta { font-size: 10.5pt; }

/* Table */
.nk-table { width: 100%; border-collapse: collapse; font-size: 10.25pt; }
.nk-table th, .nk-table td { border: 1px solid #222; padding: 6px; vertical-align: top; }
.nk-table th { font-weight: 700; background: #f7f7f7; }

/* TOC */
.nk-toc { width:100%; border-collapse: collapse; font-size: 10.75pt; }
.nk-toc td { padding: 6px 2px; }
.nk-toc .nk-toc-num { width: 14mm; text-align: right; padding-right: 6mm; font-weight: 800; }

/* Cover helpers */
.nk-cover-top { margin-top: 6mm; font-size: 10.5pt; line-height:1.45; }
.nk-cover-company .name { font-weight: 800; letter-spacing: .1px; }
.nk-cover-company .line { font-weight: 500; }
.nk-cover-right { margin-top: 16mm; font-size:10.5pt; text-align:right; }
.nk-cover-prep  { margin-top: 10mm; font-size:10.5pt; text-align:right; }

/* Photos */
.nk-photo-grid { display: grid; grid-template-columns: 1fr; gap: 6mm; }
.nk-photo-card { page-break-inside: avoid; margin-bottom: 4mm; border: 1.5px solid #333; background: #ffffff; overflow: hidden; }
.nk-photo-img-wrap { background: #ffffff; min-height: 110mm; max-height: 140mm; width: 100%; display: flex; align-items: center; justify-content: center; padding: 3mm; overflow: hidden; box-sizing: border-box; }
.nk-photo-img { display: block !important; max-width: 100% !important; max-height: 100% !important; width: auto !important; height: auto !important; object-fit: contain !important; object-position: center center !important; }
.nk-caption { margin: 0; border-top: 1.5px solid #333; background: #f9f9f9; padding: 5px 8px; font-size: 9.5pt; font-weight: 700; text-align: center; line-height: 1.35; min-height: 9mm; display: flex; align-items: center; justify-content: center; }
.nk-desc { margin: 0; padding: 4mm; border-top: 1px solid #ddd; font-size: 9.5pt; line-height: 1.5; text-align: justify; color: #222 !important; background: #ffffff; }

/* signature */
.nk-sign { margin-top: 10mm; border: 1px solid #222; padding: 6mm; display:flex; align-items:center; gap:12mm; page-break-inside: avoid; }
.nk-sign img { max-width: 70mm; max-height: 28mm; object-fit: contain; }
`;

 
const S = (v: unknown) => (v == null ? "" : String(v).trim());

// format "HH:mm" -> "12:00 PM"
function formatTime12(t?: string): string {
  if (!t) return "";
  try {
    const d = new Date(`2000-01-01T${t}`);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return t;
  }
}

const joinAddress = (form: FormData): string => {
  const parts = [
    form.streetAddress,
    [form.city, form.state].filter(Boolean).join(", "),
    [form.country, form.zipCode].filter(Boolean).join(" "),
  ].filter(Boolean).map(S).filter(Boolean);
  return parts.join(", ");
};

const headerText = (form: FormData): string => {
  const addr = joinAddress(form) || S(form.location);
  return `Progress Inspection ${addr || ""}`.trim();
};

const headerBar = (form: FormData) => `
  <div class="nk-header">
    <div class="nk-head-title">${headerText(form)}</div>
    <div class="nk-head-rule"></div>
  </div>
`;

const footerBar = () => `<div class="nk-footer">Page&nbsp;<span class="nk-page-num">ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â</span></div>`;

function mount(html: string): () => void {
  const root = document.createElement("div");
  root.className = "nk-root";
  // keep it rendered for layout, but fully off-screen and invisible
  // Hide off-screen to avoid flashing content on the page
  root.style.position = "fixed";
  root.style.left = "-10000px";
  root.style.top = "-10000px";
  root.style.opacity = "0";
  (root.style as any).pointerEvents = "none";
  (root.style as any).zIndex = "-1";
  const style = document.createElement("style");
  style.textContent = THEME_CSS;
  root.appendChild(style);
  const slot = document.createElement("div");
  slot.innerHTML = html;
  root.appendChild(slot);
  document.body.appendChild(root);
  return () => root.parentNode?.removeChild(root);
}

// robust fetch ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ dataURL
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
    // If already proxied via our API, fetch directly
    if (url.startsWith("/api/image-proxy")) {
      const r0 = await fetch(url, { cache: "no-store" });
      if (r0.ok) return await toDataURL(r0);
    }
    const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const r1 = await fetch(proxied, { cache: "no-store" });
    if (r1.ok) return await toDataURL(r1);
  } catch {}
  try {
    const ws = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ""))}`;
    const r2 = await fetch(ws, { mode: "cors", cache: "no-cache" });
    if (r2.ok) return await toDataURL(r2);
  } catch {}
  try {
    const cp = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const r3 = await fetch(cp, { mode: "cors", cache: "no-cache" });
    if (r3.ok) return await toDataURL(r3);
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
          const dataSrc = img.getAttribute("data-image-src");
          if (dataSrc) {
            const data = await fetchToDataURL(dataSrc);
            if (data) img.src = data;
            img.removeAttribute("data-image-src");
          }
          if (img.complete && img.naturalHeight > 0) return resolve();
          const done = () => resolve();
          // Fail any slow images after ~9 seconds to keep total under 5-10s
          const to = setTimeout(done, 9000);
          img.onload = () => { clearTimeout(to); resolve(); };
          img.onerror = () => { clearTimeout(to); resolve(); };
        })
    )
  );
}

async function renderNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  return await html2canvas(node, {
    // slightly lower scale for faster generation while keeping legibility
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: false,
    imageTimeout: 10000,
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
const todayStr = (d?: string) =>
  (d ? new Date(d) : new Date()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function coverPage(form: FormData): string {
  let comp = S(form.companyName) || "INSPECTION COMPANY";
  let addressLine = "";
  if (form.nameandAddressOfCompany) {
    const full = S(form.nameandAddressOfCompany);
    const parts = full.split(",").map((p) => p.trim());
    comp = parts[0] || comp;
    addressLine = parts.slice(1).join(", ");
  }

  const companyBlock = `
    <div class="nk-cover-company">
      <div class="name">${comp}</div>
      ${addressLine ? `<div class="line">${addressLine}</div>` : ""}
      ${S(form.contactPhone) ? `<div class="line">TEL. ${S(form.contactPhone)}</div>` : ""}
      ${S(form.contactEmail) ? `<div class="line">${S(form.contactEmail)}</div>` : ""}
    </div>`;

  const locationLine = (joinAddress(form) || S(form.location) || "PROJECT LOCATION").toUpperCase();

  return `
  <div class="nk-page">
    ${headerBar(form)}
    <div class="nk-cover-top">${companyBlock}</div>

    <div class="nk-block-title" style="margin-top:18mm;">CONSTRUCTION PROGRESS REPORT</div>
    <div class="nk-p" style="text-align:center; margin-top:2mm; font-weight:700;">${locationLine}</div>

    <div class="nk-cover-right"><b>REPORT DATE</b> ${todayStr(form.inspectionDate)}</div>
    <div class="nk-cover-prep">
      <div><b>Prepared for:</b> Owner</div>
      <div style="margin-top:6mm;"><b>Prepared by:</b> ${S(form.inspectorName) || "Inspector"}</div>
    </div>

    ${footerBar()}
  </div>`;
}

function disclaimerPage(form: FormData): string {
  const comp = S(form.companyName) || "INSPECTION COMPANY";
  return `
  <div class="nk-page">
    ${headerBar(form)}
    <div class="nk-block-title">Disclaimer</div>
    <p class="nk-p">
      This Report is intended solely for use by the Client in accordance with <b>${comp}</b> contract with the
      Client. While the Report may be provided to applicable authorities having jurisdiction and others for whom
      the Client is responsible, <b>${comp}</b> does not warrant the services to any third party. The report may not
      be relied upon by any other party without the express written consent of <b>${comp}</b>, which may be withheld
      at <b>${comp}</b> discretion.
    </p>
    ${footerBar()}
  </div>`;
}

function tocPage(form: FormData, items: string[]): string {
  const rows = items
    .map((t, i) => `<tr><td class="nk-toc-num">${i + 1}.</td><td>${t}</td></tr>`)
    .join("");
  return `
  <div class="nk-page">
    ${headerBar(form)}
    <div class="nk-block-title">Table of Contents</div>
    <table class="nk-toc"><tbody>${rows}</tbody></table>
    ${footerBar()}
  </div>`;
}

function autoBackground(form: FormData, photos: PhotoData[]): string {
  const sentences: string[] = [];
  const addr = joinAddress(form) || S(form.location);
  if (addr)
    sentences.push(
      `The property located at <b>${addr}</b> was reviewed for current construction progress and site safety conditions.`
    );
  if (S(form.workProgress)) sentences.push(`Observed work: ${S(form.workProgress)}.`);
  if (S(form.scheduleCompliance)) sentences.push(`Schedule position: ${S(form.scheduleCompliance)}.`);
  if (S(form.materialAvailability)) sentences.push(`Materials: ${S(form.materialAvailability)}.`);
  if (S(form.safetyCompliance)) sentences.push(`Safety compliance: ${S(form.safetyCompliance)}.`);
  if (S(form.safetySignage)) sentences.push(`Safety signage and access control: ${S(form.safetySignage)}.`);
  if (!sentences.length)
    sentences.push(
      "This section summarizes project background based on inspector inputs and photographic evidence collected during the visit."
    );
  if (photos.length) {
    const first = photos[0];
    const example = S(first.caption) ? `"${S(first.caption)}"` : "an image";
    sentences.push(`Photographic evidence documents on-site conditions. For example, ${example} was recorded.`);
  }
  return `<p class="nk-p">${sentences.join(" ")}</p>`;
}

/* Helpers */
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function obsTable(form: FormData): string {
  const rows: string[] = [];

  // Address lines ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ build full postal, fallback to free-form location
  const addrJoined =
    [form.streetAddress, [form.city, form.state].filter(Boolean).join(", "),
     [form.country, form.zipCode].filter(Boolean).join(" ")]
      .filter(Boolean).map(S).filter(Boolean).join(", ");
  const addrFallback = addrJoined || S(form.location);

  // Weather snapshot
  const weatherBits: string[] = [];
  if (S(form.temperature))        weatherBits.push(`${S(form.temperature)}Ãƒâ€šÃ‚Â°C`);
  if (S(form.weatherDescription)) weatherBits.push(S(form.weatherDescription));
  if (S(form.humidity))           weatherBits.push(`Humidity ${S(form.humidity)}%`);
  if (S(form.windSpeed))          weatherBits.push(`Wind ${S(form.windSpeed)} m/s`);

  const addRow = (label: string, val?: string) => {
    const v = S(val);
    if (v) rows.push(`<tr><td><b>${label}</b></td><td class="nk-meta">${v}</td></tr>`);
  };

  addRow("Status",      form.status);
  addRow("Report ID",                    form.reportId);
  addRow("Name of Filed Inspector",      form.inspectorName);
  addRow("Name and Address of Inspection Company", form.nameandAddressOfCompany);
  addRow("Client / Owner Name",          form.clientName);
  addRow("Company Name",                 form.companyName);
  addRow("Phone Number of Inspection Company", form.contactPhone);
  addRow("Email of Inspection Company",  form.contactEmail);
  addRow("Date of Inspection",           todayStr(form.inspectionDate));
  addRow("Start Time of Inspection",     formatTime12(form.startInspectionTime));

  // Location
  addRow("Inspection Property Address",  addrFallback);

  // Weather (if present)
  if (weatherBits.length) {
    addRow("Weather Conditions", weatherBits.join(" | "));
  }

  return `
    <table class="nk-table">
      <thead><tr><th style="width:40%;">Field</th><th>Details</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function photoCard(p: PhotoData, num: number): string {
  const isRemote = p.data && p.data.startsWith("http");
  const srcAttr = isRemote ? `data-image-src="${p.data}" src=""` : `src="${p.data}"`;
  const userCaption = S(p.caption);
  const desc = S(p.description);

  return `
  <div class="nk-photo-card">
    <div class="nk-photo-img-wrap">
      <img class="nk-photo-img" ${srcAttr} alt="Photo ${num}" loading="eager" />
    </div>
    <div class="nk-caption">Photo ${num}${userCaption ? `: ${userCaption}` : ""}</div>
    ${desc ? `<div class="nk-desc">${desc}</div>` : ""}
  </div>`;
}

/* Strict 2-photo-per-page paginator with optional intro HTML on first page */
function photoPages(
  form: FormData,
  baseTitle: string,         // e.g., "3. Field Observation" or "Personnel & Work Progress"
  photos: PhotoData[],
  startNum = 1,
  introHTML = ""             // rendered only on first page of this section
): string {
  if (!photos?.length) {
    if (S(introHTML)) {
      return `
        <div class="nk-page">
          ${headerBar(form)}
          <div class="nk-block-title">${baseTitle}</div>
          ${introHTML}
          ${footerBar()}
        </div>`;
    }
    return "";
  }

  const groups = chunk(photos, 2);
  return groups
    .map((group, gi) => {
      const title = gi === 0 ? baseTitle : `${baseTitle} (cont.)`;
      const numOffset = gi * 2;
      return `
        <div class="nk-page">
          ${headerBar(form)}
          <div class="nk-block-title">${title}</div>
          ${gi === 0 ? S(introHTML) : ""}
          <div class="nk-photo-grid">
            ${group.map((p, i) => photoCard(p, startNum + numOffset + i)).join("")}
          </div>
          ${footerBar()}
        </div>`;
    })
    .join("");
}

/* =========================
   BODY BUILDER
   ========================= */
function buildBodyHTML(
  form: FormData,
  backgroundHTML: string,
  buckets: Record<string, PhotoData[]>,
  fieldText?: string,
  siteMap?: PhotoData
): string {
  const h = (f: FormData) => headerBar(f);
  const ftr = () => footerBar();

  // 1. Site location + summary
  const page1 = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">1. Site location and Field Condition Summary</div>
    ${obsTable(form)}
    ${ftr()}
  </div>`;

  // 1b. Optional Site Map directly after page 1
  const siteMapHTML = (() => {
    if (!siteMap || !siteMap.data) return "";
    const isRemote = siteMap.data.startsWith("http");
    const srcAttr = isRemote
      ? `data-image-src="${siteMap.data}" src=""`
      : `src="${siteMap.data}"`;
    return `
      <div class="nk-page">
        ${h(form)}
        <div class="nk-block-title">Site Location Map</div>
        <div class="nk-photo-card">
          <div class="nk-photo-img-wrap">
            <img class="nk-photo-img" ${srcAttr} alt="Site Map" loading="eager" />
          </div>
          <div class="nk-caption">${S(siteMap.caption) || "Site location map"}</div>
          ${S(siteMap.description) ? `<div class=\"nk-desc\">${S(siteMap.description)}</div>` : ""}
        </div>
        ${ftr()}
      </div>`;
  })();

  // 2. Background (text + 2-per-page photos)
  let backgroundSection = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">2. Background</div>
    ${backgroundHTML}
    ${ftr()}
  </div>`;
  if ((buckets.background?.length ?? 0) > 0) {
    backgroundSection = photoPages(form, "2. Background", buckets.background, 1, backgroundHTML);
  }

  // 3. Field Observation (intro + strict 2 per page)
  const fieldIntro = S(fieldText) ? `<p class="nk-p">${S(fieldText)}</p>` : "";
  const fieldObsSection =
    (buckets.fieldObservation?.length ?? 0) > 0
      ? photoPages(form, "3. Field Observation", buckets.fieldObservation, 1, fieldIntro)
      : `
        <div class="nk-page">
          ${h(form)}
          <div class="nk-block-title">3. Field Observation</div>
          ${fieldIntro || `<p class="nk-p">No photos were attached.</p>`}
          ${ftr()}
        </div>
      `;

  // EXTRA (unnumbered): Personnel & Work Progress (info + 2-per-page photos)
  const workInfo = [
    S(form.workerAttendance) && `<div class="nk-p" style="text-align:left;"><b>All workers present & on time?</b> ${S(form.workerAttendance)}</div>`,
    S(form.scheduleCompliance) && `<div class="nk-p" style="text-align:left;"><b>Progress vs schedule:</b> ${S(form.scheduleCompliance)}</div>`,
    S(form.materialAvailability) && `<div class="nk-p" style="text-align:left;"><b>Materials available & usable?</b> ${S(form.materialAvailability)}</div>`,
    S(form.workProgress) && `<div class="nk-p" style="text-align:left;"><b>Current work progress:</b> ${S(form.workProgress)}</div>`,
  ].filter(Boolean).join("");
  const workSection =
    workInfo || (buckets.work?.length ?? 0) > 0
      ? photoPages(form, "Personnel & Work Progress", buckets.work, 1, workInfo)
      : "";

  // EXTRA (unnumbered): Safety & Compliance
  const safetyInfo = [
    S(form.safetyCompliance) && `<div class="nk-p" style="text-align:left;"><b>All safety protocols & PPE followed?</b> ${S(form.safetyCompliance)}</div>`,
    S(form.safetySignage) && `<div class="nk-p" style="text-align:left;"><b>Safety signage & access control in place?</b> ${S(form.safetySignage)}</div>`,
  ].filter(Boolean).join("");
  const safetySection =
    safetyInfo || (buckets.safety?.length ?? 0) > 0
      ? photoPages(form, "Safety & Compliance", buckets.safety, 1, safetyInfo)
      : "";

  // EXTRA (unnumbered): Inspection Support Equipment (if any)
  const equipmentSection =
    (buckets.equipment?.length ?? 0) > 0
      ? photoPages(form, "Inspection Support Equipment (if any)", buckets.equipment)
      : "";

  // EXTRA (unnumbered): Additional Images (optional)
  const additionalSection =
    (buckets.additional?.length ?? 0) > 0
      ? photoPages(form, "Additional Images (optional)", buckets.additional)
      : "";

  // 4. Conclusion (numbered to match TOC)
  const parts: string[] = [];
  if (S(form.status)) parts.push(`Overall status: <b>${S(form.status)}</b>.`);
  if (S(form.scheduleCompliance)) parts.push(`Schedule: <b>${S(form.scheduleCompliance)}</b>.`);
  if (S(form.materialAvailability)) parts.push(`Materials: <b>${S(form.materialAvailability)}</b>.`);
  if (S(form.safetyCompliance)) parts.push(`Safety: <b>${S(form.safetyCompliance)}</b>.`);
  const base =
    parts.length
      ? `<p class="nk-p">${parts.join(" ")}</p>`
      : `<p class="nk-p">No critical blockers observed at the time of inspection. Continue to monitor schedule, safety, and materials.</p>`;
  const extras = [
    S(form.additionalComments) && `<p class="nk-p"><b>Notes & Recommendations:</b> ${S(form.additionalComments)}</p>`,
    S(form.inspectorSummary) && `<p class="nk-p"><b>InspectorÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s Summary:</b> ${S(form.inspectorSummary)}</p>`,
    S(form.recommendations) && `<p class="nk-p"><b>Recommended Actions:</b> ${S(form.recommendations)}</p>`,
  ]
    .filter(Boolean)
    .join("");
  const sign = form.signatureData
    ? `<div class="nk-sign"><img src="${form.signatureData}" alt="Signature" /><div><div><b>Inspector:</b> ${S(form.inspectorName) || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</div></div></div>`
    : "";

  const pageLast = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">4. Conclusion</div>
    ${base}${extras}
    ${sign}
    ${ftr()}
  </div>`;

  return page1 + siteMapHTML + backgroundSection + fieldObsSection + workSection + safetySection + equipmentSection + additionalSection + pageLast;
}

/* =========================
   RENDER ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ PDF
   ========================= */
async function renderRootToPDF(root: HTMLElement, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf: JsPDFType = new jsPDF("p", "mm", "a4");

  // inject page numbers before rendering
  const allPages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"));
  allPages.forEach((p, idx) => {
    const span = p.querySelector(".nk-footer .nk-page-num");
    if (span) span.textContent = String(idx + 1);
  });

  await waitForImages(root);

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"));
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i]);
    const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgW = canvas.width * scale;
    const imgH = canvas.height * scale;
    const x = (pageWidth - imgW) / 2;
    const y = 0;

    if (i > 0) pdf.addPage();
    const { data, type } = canvasToImg(canvas);
    // Use FAST compression for quicker generation; file may be slightly larger
    pdf.addImage(data, type, x, y, imgW, imgH, undefined, "FAST");
  }

  pdf.save(filename);
}

/* =========================
   PUBLIC API
   ========================= */
export async function generateFullReportPDF(
  form: FormData,
  sectionPhotos: Record<string, PhotoData[]>,
  signatureData: string | null,
  siteMap?: PhotoData
): Promise<void> {
  if (typeof window === "undefined") return;

  // TOC is forced to exactly 4 items, even if extra pages exist
  const toc = [
    "Site location and Field Condition Summary",
    "Background",
    "Field Observation",
    "Conclusion",
  ];

  // Buckets used by body (ensure keys exist)
  const buckets: Record<string, PhotoData[]> = {
    background: sectionPhotos?.background || [],
    fieldObservation: sectionPhotos?.fieldObservation || [],
    work: sectionPhotos?.work || [],
    safety: sectionPhotos?.safety || [],
    equipment: sectionPhotos?.equipment || [],
    additional: sectionPhotos?.additional || [],
  };

  // Background: prefer UI auto; otherwise compute (use fieldObservation photos if background empty)
  const bgAuto =
    S(form.backgroundAuto) ||
    autoBackground(form, buckets.background.length ? buckets.background : buckets.fieldObservation);

  const backgroundHTML = [
    S(form.backgroundManual) && `<p class="nk-p">${S(form.backgroundManual)}</p>`,
    bgAuto,
  ]
    .filter(Boolean)
    .join("");

  const formPlus = signatureData ? { ...form, signatureData } : form;

  const html =
    coverPage(formPlus) +
    disclaimerPage(formPlus) +
    tocPage(formPlus, toc) +
    buildBodyHTML(formPlus, backgroundHTML, buckets, formPlus.fieldObservationText, siteMap);

  const cleanup = mount(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const nameBase =
      (S(formPlus.reportId) || S(formPlus.clientName) || S(formPlus.location) || "report")
        .replace(/[^\w.-]+/g, "_") || "report";
    await renderRootToPDF(root, `ninekiwi_report_${nameBase}_${dateStr}.pdf`);
  } finally {
    cleanup();
  }
}

export async function generateSummaryPDF(
  form: FormData,
  summaryPhotos: PhotoData[],
  additionalPhotos: PhotoData[] = [],
  signatureData?: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  // TOC is forced to exactly 4 items in summaries too
  const toc = [
    "Site location and Field Condition Summary",
    "Background",
    "Field Observation",
    "Conclusion",
  ];

  const buckets: Record<string, PhotoData[]> = {
    background: [], // typically unused in summaries
    fieldObservation: [...summaryPhotos, ...additionalPhotos],
    work: [],
    safety: [],
    equipment: [],
    additional: [],
  };

  const formPlus = signatureData ? { ...form, signatureData } : form;
  const bgAuto = S(formPlus.backgroundAuto) || autoBackground(formPlus, buckets.fieldObservation);
  const backgroundHTML = [
    S(formPlus.backgroundManual) && `<p class="nk-p">${S(formPlus.backgroundManual)}</p>`,
    bgAuto,
  ]
    .filter(Boolean)
    .join("");

  const html =
    coverPage(formPlus) +
    disclaimerPage(formPlus) +
    tocPage(formPlus, toc) +
    buildBodyHTML(formPlus, backgroundHTML, buckets, formPlus.fieldObservationText);

  const cleanup = mount(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const nameBase =
      (S(formPlus.reportId) || S(formPlus.clientName) || S(formPlus.location) || "summary")
        .replace(/[^\w.-]+/g, "_") || "summary";
    await renderRootToPDF(root, `ninekiwi_summary_${nameBase}_${dateStr}.pdf`);
  } finally {
    cleanup();
  }
}

export async function generateSummaryWord(_form: FormData, _summaryPhotos: PhotoData[]): Promise<void> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } = await import("docx");
  const fs_mod = await import("file-saver"); const saveAs = (fs_mod as any).saveAs || (fs_mod as any).default;

  function S2(v: unknown) { return v == null ? "" : String(v); }
  function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    try {
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    } catch {
      return new Uint8Array();
    }
  }

  const children: any[] = [];
  children.push(new Paragraph({ text: "NineKiwi - Auto Summary", heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: `Report ID: ${S2(_form.reportId)}` }));
  children.push(new Paragraph({ text: `Inspector: ${S2(_form.inspectorName)}` }));
  children.push(new Paragraph({ text: `Client: ${S2(_form.clientName)}` }));
  children.push(new Paragraph({ text: `Location: ${S2(_form.location)}` }));
  children.push(new Paragraph({ text: `Date: ${S2(_form.inspectionDate)}` }));

  // Photos listing
  const photos = _summaryPhotos || [];
  if (photos.length) {
    children.push(new Paragraph({ text: "Photos", heading: HeadingLevel.HEADING_2 }));
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      children.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${p.caption || p.name || "Photo"}`, bold: true })] }));
      let dataUrl = p.data;
      if (dataUrl && dataUrl.startsWith("http")) {
        try { const d = await fetchToDataURL(dataUrl); if (d) dataUrl = d; } catch {}
      }
      if (dataUrl && dataUrl.startsWith("data:")) {
        const buf = dataUrlToUint8Array(dataUrl);
        if (buf.length) children.push(new Paragraph({ children: [ new ImageRun({ data: buf, transformation: { width: 520, height: 280 } }) ] }));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `ninekiwi_summary_${S(_form.reportId) || "report"}.docx`);
}

// Simple adapter for AutoSummary component to export PDF
export async function generateAutoSummaryPDF(form: any, photos: any[]): Promise<void> {
  const mapped: PhotoData[] = (photos || []).map((p) => ({ name: p.name || "Photo", data: p.data, includeInSummary: true, caption: p.caption, description: p.description }));
  await generateSummaryPDF(form, mapped, [], form?.signatureData || null);
}

export async function generateAutoSummaryWord(form: any, photos: any[]): Promise<void> {
  const mapped: PhotoData[] = (photos || []).map((p) => ({ name: p.name || "Photo", data: p.data, includeInSummary: true, caption: p.caption, description: p.description }));
  await generateSummaryWord(form, mapped);
}

// Full report to Word (lightweight structure)
export async function generateFullReportDOCX(
  form: FormData,
  sectionPhotos: Record<string, PhotoData[]>,
  signatureData: string | null,
  siteMap?: PhotoData
): Promise<void> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } = await import("docx");
  const fs_mod = await import("file-saver"); const saveAs = (fs_mod as any).saveAs || (fs_mod as any).default;

  function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    try {
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    } catch { return new Uint8Array(); }
  }

  async function toImageRun(ph: PhotoData): Promise<any | null> {
    let data = ph.data;
    if (data && data.startsWith("http")) {
      try { const d = await fetchToDataURL(data); if (d) data = d; } catch {}
    }
    if (!data || !data.startsWith("data:")) return null;
    const buf = dataUrlToUint8Array(data);
    if (!buf.length) return null;
    return new ImageRun({ data: buf, transformation: { width: 520, height: 320 } });
  }

  const children: any[] = [];
  children.push(new Paragraph({ text: "NineKiwi - Site Inspection Report", heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: `${S(form.companyName)} | ${S(form.location)} | ${S(form.inspectionDate)}` }));

  // Optional site map as first image section
  if (siteMap) {
    const img = await toImageRun(siteMap);
    if (img) {
      children.push(new Paragraph({ text: "Site Location Map", heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ children: [img] }));
    }
  }
  // 1. Site location and Field Condition Summary (key details)
  const kv = (label: string, value?: string | number) =>
    value != null && String(value).trim() !== ""
      ? new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: String(value) }),
          ],
        })
      : null;
  children.push(new Paragraph({ text: "1. Site location and Field Condition Summary", heading: HeadingLevel.HEADING_2 }));
  const addrLine = [S(form.streetAddress), S(form.city), S(form.state), S(form.country), S(form.zipCode)].filter(Boolean).join(", ");
  [
    kv("Status", S(form.status)),
    kv("Report ID", S(form.reportId)),
    kv("Inspector", S(form.inspectorName)),
    kv("Client", S(form.clientName)),
    kv("Company", S(form.companyName)),
    kv("Contact", [S(form.contactPhone), S(form.contactEmail)].filter(Boolean).join(" | ")),
    kv("Location", addrLine || S(form.location)),
    /*
    kv("Coordinates", (S(form.lat) && S(form.lon)) ? `${S(form.lat)}, ${S(form.lon)}` : ""),
    kv("Inspection Date", S(form.inspectionDate)),
    kv("Start Time", S(form.startInspectionTime)),
    kv("Temperature", S(form.temperature) ? ${S(form.temperature)}Â°C : ""),
    kv("Humidity", S(form.humidity) ? ${S(form.humidity)}% : ""),
    kv("Wind", S(form.windSpeed) ? ${S(form.windSpeed)} m/s : ""),
    kv("Conditions", S(form.weatherDescription)),
  */
  ].forEach((p) => { if (p) children.push(p); });

  // Add remaining key details
  [
    kv("Coordinates", S(form.lat) && S(form.lon) ? `${S(form.lat)}, ${S(form.lon)}` : ""),
    kv("Inspection Date", S(form.inspectionDate)),
    kv("Start Time", S(form.startInspectionTime)),
    kv("Temperature", S(form.temperature) ? `${S(form.temperature)}°C` : ""),
    kv("Humidity", S(form.humidity) ? `${S(form.humidity)}%` : ""),
    kv("Wind", S(form.windSpeed) ? `${S(form.windSpeed)} m/s` : ""),
    kv("Conditions", S(form.weatherDescription)),
  ].forEach((p) => { if (p) children.push(p); });

  // 2. Background (manual + auto)
  const bgAutoWord = S(form.backgroundAuto) || autoBackground(form, sectionPhotos.background?.length ? sectionPhotos.background : sectionPhotos.fieldObservation || []);
  if (S(form.backgroundManual) || bgAutoWord) {
    children.push(new Paragraph({ text: "2. Background", heading: HeadingLevel.HEADING_2 }));
    if (S(form.backgroundManual)) children.push(new Paragraph({ text: S(form.backgroundManual) }));
    if (bgAutoWord) {
      const plain = bgAutoWord.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      children.push(new Paragraph({ text: plain }));
    }
  }

  // 3. Field Observation (intro)
  children.push(new Paragraph({ text: "3. Field Observation", heading: HeadingLevel.HEADING_2 }));
  if (S(form.fieldObservationText)) children.push(new Paragraph({ text: S(form.fieldObservationText) }));

  // Personnel & Work Progress
  const workInfoDoc: string[] = [];
  if (S(form.workerAttendance)) workInfoDoc.push(`All workers present & on time?: ${S(form.workerAttendance)}`);
  if (S(form.scheduleCompliance)) workInfoDoc.push(`Progress vs schedule: ${S(form.scheduleCompliance)}`);
  if (S(form.materialAvailability)) workInfoDoc.push(`Materials available & usable?: ${S(form.materialAvailability)}`);
  if (S(form.workProgress)) workInfoDoc.push(`Current work progress: ${S(form.workProgress)}`);
  if (workInfoDoc.length) {
    children.push(new Paragraph({ text: "Personnel & Work Progress", heading: HeadingLevel.HEADING_2 }));
    workInfoDoc.forEach((t) => children.push(new Paragraph({ text: t })));
  }

  // Safety & Compliance
  const safetyInfoDoc: string[] = [];
  if (S(form.safetyCompliance)) safetyInfoDoc.push(`Safety Compliance: ${S(form.safetyCompliance)}`);
  if (S(form.safetySignage)) safetyInfoDoc.push(`Safety Signage: ${S(form.safetySignage)}`);
  if (safetyInfoDoc.length) {
    children.push(new Paragraph({ text: "Safety & Compliance", heading: HeadingLevel.HEADING_2 }));
    safetyInfoDoc.forEach((t) => children.push(new Paragraph({ text: t })));
  }
  // Add sections photos
  for (const [key, arr] of Object.entries(sectionPhotos)) {
    if (key === "background" || key === "fieldObservation") continue;
    const photos = (arr || []).slice(0);
    if (!photos.length) continue;
    const title = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }));
    for (const ph of photos) {
      const ir = await toImageRun(ph);
      if (ir) {
        children.push(new Paragraph({ children: [ir] }));
        if (ph.caption) children.push(new Paragraph({ text: ph.caption }));
        if (ph.description) children.push(new Paragraph({ text: ph.description }));
      }
    }
  }

  if (signatureData && signatureData.startsWith("data:")) {
    const sigBuf = dataUrlToUint8Array(signatureData);
    if (sigBuf.length) {
      children.push(new Paragraph({ text: "Signature", heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ children: [ new ImageRun({ data: sigBuf, transformation: { width: 300, height: 120 } }) ] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const dateStr = new Date().toISOString().split("T")[0];
  const nameBase = (S(form.reportId) || S(form.clientName) || S(form.location) || "report").replace(/[^\w.-]+/g, "_") || "report";
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `ninekiwi_report_${nameBase}_${dateStr}.docx`);
}

// Add this function to your export.ts file
export async function saveReportToDatabase(
  form: FormData,
  photos: Record<string, PhotoData[]>
): Promise<string> {
  try {
    const allPhotos = [
      ...(photos.background || []),
      ...(photos.fieldObservation || []),
      ...(photos.work || []),
      ...(photos.safety || []),
      ...(photos.equipment || []),
      ...(photos.additional || []),
    ].map((photo, index) => ({
      ...photo,
      section: Object.keys(photos).find(key => 
        photos[key].includes(photo)
      ) || 'fieldObservation',
    }));

    const response = await fetch('/api/reports/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: form,
        photos: allPhotos,
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to save report');
    }

    return data.reportId;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}
