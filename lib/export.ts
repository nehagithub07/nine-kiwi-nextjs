// eslint-disable @typescript-eslint/no-explicit-any
"use client";

import type { jsPDF as JsPDFType } from "jspdf";
import { jsPDF as JsPDFClass } from "jspdf";

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
  // Selected report purpose/type from UI
  // Examples: "General Field Inspection", "Construction Progress",
  // "Structural Condition Survey", "Building Inspection", "Car Garage Inspection"
  purposeOfFieldVisit?: string;
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
  color: #000 !important;
  font-family: Inter, Arial, Helvetica, sans-serif !important;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.nk-page { width: 210mm; min-height: 297mm; padding: 16mm 16mm 18mm 16mm; page-break-after: always; background: #fff; position: relative; }
.nk-page:last-child { page-break-after: auto; }

/* Header */
.nk-header { margin: 0 0 6mm 0; }
.nk-head-title { text-align:center; font-size:11.25pt; font-weight:800; letter-spacing: .15px; }
.nk-head-rule  { height:0; border-bottom: 2px solid #000; margin-top:4px; opacity: 1; }

/* Footer (page number centered) */
.nk-footer {
  position: absolute; left: 16mm; right: 16mm; bottom: 10mm;
  display: flex; justify-content: center; align-items: center;
  font-size: 10pt; font-weight: 700;
}

/* Titles */
.nk-block-title { font-size: 14pt; font-weight: 800; margin: 6mm 0 6mm 0; text-align:center; letter-spacing: .2px; padding-bottom: 2mm; }
.nk-p { font-size: 12pt; line-height: 1.58; text-align: justify; }
.nk-meta { font-size: 11.5pt; }

/* Table - no borders, plain white backgrounds */
.nk-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
.nk-table th, .nk-table td { border: 0; padding: 6px; vertical-align: top; }
.nk-table th { font-weight: 700; background: #fff; }
.nk-table tbody tr:nth-child(even) { background: #fff; }

/* Intro block spacing (prevents photos from crowding text) */
.nk-intro { margin-bottom: 8mm; }

/* Background callout - no border, plain background */
.nk-callout { background: #fff; padding: 8mm; }
.nk-callout h3 { margin: 0 0 3mm 0; font-size: 10.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }

/* Summary UI helpers - remove borders and colors */
.nk-sum-grid { display: grid; grid-template-columns: 1fr; gap: 4mm; }
.nk-sum-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; }
.nk-card { border: 0; background: #fff; padding: 8mm; }
.nk-card h3 { margin: 0 0 3mm 0; font-size: 10.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }
.nk-badge { display: inline-block; padding: 2px 6px; border-radius: 6px; border: 1px solid #000; font-weight: 700; font-size: 10pt; background: #fff; }
.nk-badge-positive { color: #000; border-color: #000; }
.nk-badge-caution { color: #000; border-color: #000; }
.nk-badge-critical { color: #000; border-color: #000; }
.nk-badge-neutral { color: #000; border-color: #000; }
.nk-muted { color: #000 !important; }

/* Two-column helper for Background intro */
.nk-grid-2 { display: grid; grid-template-columns: 1.25fr 1fr; gap: 6mm; align-items: start; }

/* TOC - no borders */
.nk-toc { width:100%; border-collapse: collapse; font-size: 11.5pt; }
.nk-toc td { border: 0; padding: 6px 2px; }
.nk-toc .nk-toc-num { width: 14mm; text-align: right; padding-right: 6mm; font-weight: 800; }

/* Cover helpers */
.nk-cover-top { margin-top: 6mm; font-size: 10.5pt; line-height:1.45; }
.nk-cover-company .name { font-weight: 800; letter-spacing: .1px; }
.nk-cover-company .line { font-weight: 500; }
.nk-cover-right { margin-top: 16mm; font-size:10.5pt; text-align:right; }
.nk-cover-prep  { margin-top: 10mm; font-size:10.5pt; text-align:right; }

/* Photos - improved grid for 2-column layout, larger image areas */
.nk-photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.nk-photo-card { page-break-inside: avoid; margin-bottom: 4mm; border: 0; background: #fff; overflow: hidden; }
.nk-photo-img-wrap { background: #fff; min-height: 120mm; max-height: 150mm; width: 100%; display: flex; align-items: center; justify-content: center; padding: 3mm; overflow: hidden; box-sizing: border-box; }
.nk-photo-img { display: block !important; max-width: 100% !important; max-height: 100% !important; width: auto !important; height: auto !important; object-fit: contain !important; object-position: center center !important; }
.nk-caption { margin: 0; border-top: 0; background: #fff; padding: 5px 8px; font-size: 10.5pt; font-weight: 700; text-align: center; line-height: 1.35; min-height: 9mm; display: flex; align-items: center; justify-content: center; }
.nk-desc { margin: 0; padding: 4mm; border-top: 0; font-size: 9.5pt; line-height: 1.5; text-align: justify; background: #fff; }

/* signature */
.nk-sign { margin-top: 10mm; border: 0; padding: 6mm; display:flex; align-items:center; gap:12mm; page-break-inside: avoid; }
.nk-sign img { max-width: 70mm; max-height: 28mm; object-fit: contain; }
`;

 
const S = (v: unknown) => (v == null ? "" : String(v).trim());

// Resolve coordinates from form: prefer explicit lat/lon; otherwise geocode from address
async function resolveCoords(form: FormData): Promise<{ lat: number; lon: number } | null> {
  const latNum = Number((form as any)?.lat);
  const lonNum = Number((form as any)?.lon);
  if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
    return { lat: latNum, lon: lonNum };
  }

  const addr = [form.streetAddress,
    [form.city, form.state].filter(Boolean).join(", "),
    [form.country, form.zipCode].filter(Boolean).join(" "),
  ].filter(Boolean).map(S).filter(Boolean).join(", ") || S(form.location);

  if (!addr) return null;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(addr)}&count=1`;
    const r = await fetch(url, { headers: { 'Accept-Language': 'en' }, cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    const first = j?.results?.[0];
    const lat = Number(first?.latitude);
    const lon = Number(first?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  } catch {}
  return null;
}

// Build static map photo (Google Static Maps if key present, else OSM staticmap)
async function buildSiteMapFromForm(form: FormData): Promise<PhotoData | undefined> {
  try {
    const coords = await resolveCoords(form);
    if (!coords) return undefined;
    const gkey = (process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY || '').trim();
    const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lon}&zoom=15&size=1200x600&scale=2&maptype=roadmap&markers=color:green|${coords.lat},${coords.lon}${gkey ? `&key=${gkey}` : ''}`;
    const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lon}&zoom=15&size=1200x600&markers=${coords.lat},${coords.lon},lightgreen-pushpin`;

    // Try Google first if key present; fall back to OSM if fetch fails or not an image
    const tryUrl = async (u: string): Promise<string> => {
      const d = await fetchToDataURL(u).catch(() => '');
      return d && d.startsWith('data:') ? d : '';
    };

    let data = '';
    if (gkey) data = await tryUrl(googleUrl);
    if (!data) data = await tryUrl(osmUrl);

    const photo: PhotoData = {
      name: 'Site Map',
      data: data || osmUrl,
      caption: 'Site location map',
      description: '',
    };
    return photo;
  } catch { return undefined; }
}

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
  const purpose = S((form as any).purposeOfFieldVisit);
  const base = purpose || "Progress Inspection";
  return [base, addr].filter(Boolean).join(" ");
};

const headerBar = (form: FormData) => `
  <div class="nk-header">
    <div class="nk-head-title">${headerText(form)}</div>
    <div class="nk-head-rule"></div>
  </div>
`;

const footerBar = () => `
  <div class="nk-footer">
    Page&nbsp;<span class="nk-page-num">1</span>
  
  </div>
`;

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

// robust fetch to dataURL
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
  const purpose = S((form as any).purposeOfFieldVisit);
  const normalized = purpose ? purpose.toUpperCase() : "";
  const coverTitle = normalized
    ? (normalized.endsWith(" REPORT") ? normalized : `${normalized} REPORT`)
    : "CONSTRUCTION PROGRESS REPORT";

  return `
  <div class="nk-page">
    ${headerBar(form)}
    <div class="nk-cover-top">${companyBlock}</div>

    <div class="nk-block-title" style="margin-top:18mm;">${coverTitle}</div>
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

function backgroundHighlights(form: FormData): string {
  const rows: string[] = [];
  const add = (label: string, val?: string) => { const v = S(val); if (v) rows.push(`<tr><td style="width:40%;"><b>${label}</b></td><td class="nk-meta">${v}</td></tr>`); };
  const addr = joinAddress(form) || S(form.location);
  add("Purpose", S((form as any).purposeOfFieldVisit));
  add("Address", addr);
  add("Date", todayStr(form.inspectionDate));
  add("Start Time", formatTime12(form.startInspectionTime));
  add("Work Progress", S(form.workProgress));
  add("Schedule", S(form.scheduleCompliance));
  add("Materials", S(form.materialAvailability));
  add("Safety", S(form.safetyCompliance));
  if (!rows.length) return "";
  return `<div class="nk-card" style="margin-top:4mm; page-break-inside: avoid;"><h3>Background Highlights</h3><table class="nk-table"><thead><tr><th style="width:40%;">Field</th><th>Details</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

/* Helpers */
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function obsTable(form: FormData): string {
  const rows: string[] = [];

  // Address lines - build full postal, fallback to free-form location
  const addrJoined =
    [form.streetAddress, [form.city, form.state].filter(Boolean).join(", "),
     [form.country, form.zipCode].filter(Boolean).join(" ")]
      .filter(Boolean).map(S).filter(Boolean).join(", ");
  const addrFallback = addrJoined || S(form.location);

  // Weather snapshot
  const weatherBits: string[] = [];
  if (S(form.temperature))        weatherBits.push(`${S(form.temperature)}°C`);
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

  // Safety & Compliance (inline on summary page)
  addRow("All safety protocols & PPE followed?", form.safetyCompliance);
  addRow("Safety signage & access control in place?", form.safetySignage);

  // Personnel & Work Progress (inline on summary page)
  addRow("All workers present & on time?", form.workerAttendance);
  addRow("Progress vs schedule", form.scheduleCompliance);
  addRow("Materials available & usable?", form.materialAvailability);
  addRow("Current work progress", form.workProgress);

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
          <div class="nk-intro">${introHTML}</div>
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
          ${gi === 0 ? `<div class=\"nk-intro\">${S(introHTML)}</div>` : ""}
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

  // 2. Background (text + 2-per-page photos) with callout and highlights
  const highlightsHTML = backgroundHighlights(form);
  const calloutHTML = S(backgroundHTML)
    ? `<div class="nk-callout" style="page-break-inside: avoid;"><h3>Background Narrative</h3>${backgroundHTML}</div>`
    : "";
  const backgroundIntro = calloutHTML && highlightsHTML
    ? `<div class="nk-grid-2">${calloutHTML}${highlightsHTML}</div>`
    : (calloutHTML || highlightsHTML || "");
  let backgroundSection = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">2. Background</div>
    ${backgroundIntro ? `<div class="nk-intro">${backgroundIntro}</div>` : ""}
    ${ftr()}
  </div>`;
  if ((buckets.background?.length ?? 0) > 0) {
    backgroundSection = photoPages(form, "2. Background", buckets.background, 1, backgroundIntro);
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
          <div class="nk-intro">${fieldIntro || `<p class="nk-p">No photos were attached.</p>`}</div>
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
    S(form.inspectorSummary) && `<p class="nk-p"><b>Inspector Summary:</b> ${S(form.inspectorSummary)}</p>`,
    S(form.recommendations) && `<p class="nk-p"><b>Recommended Actions:</b> ${S(form.recommendations)}</p>`,
  ]
    .filter(Boolean)
    .join("");
  const sign = form.signatureData
    ? `<div class="nk-sign"><img src="${form.signatureData}" alt="Signature" /><div><div><b>Inspector:</b> ${S(form.inspectorName) || "Inspector"}</div></div></div>`
    : "";

  const pageLast = `
  <div class="nk-page">
    ${h(form)}
    <div class="nk-block-title">4. Conclusion</div>
    ${base}${extras}
    ${sign}
    ${ftr()}
  </div>`;

  return page1 + siteMapHTML + backgroundSection + fieldObsSection + additionalSection + equipmentSection + pageLast;
}

/* =========================
   RENDER TO PDF
   ========================= */
async function renderRootToPDF(root: HTMLElement, filename: string): Promise<void> {
  // Use static import to avoid ChunkLoadError on dynamic import
  const pdf: JsPDFType = new JsPDFClass("p", "mm", "a4");

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
  // Auto-build site map if not provided from caller
  const siteMapFinal = siteMap || await buildSiteMapFromForm(formPlus);

  const html =
    coverPage(formPlus) +
    disclaimerPage(formPlus) +
    tocPage(formPlus, toc) +
    buildBodyHTML(formPlus, backgroundHTML, buckets, formPlus.fieldObservationText, siteMapFinal);

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
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, Table, TableRow, TableCell } = await import("docx");
  //@ts-ignore
  const fs_mod = await import("file-saver"); const saveAs = (fs_mod as any).saveAs || (fs_mod as any).default;

  function S2(v: unknown) { return v == null ? "" : String(v).trim(); }
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

  // Build the same content as Auto Summary PDF
  const POSITIVE_RE = /(on track|compliant|available|complete|good|clear|safe|yes|ok|met|satisfactory|no issues|adequate)/i;
  const CAUTION_RE = /(monitor|pending|partial|limited|follow up|minor|in progress|ongoing|watch)/i;
  const CRITICAL_RE = /(delay|behind|blocked|risk|hazard|unsafe|critical|stop|halt|fail|shortage|defect|non-?compliant|incident|accident|escalate|breach)/i;
  const tone = (txt?: string) => {
    const t = S2(txt);
    if (!t) return "neutral" as const;
    if (CRITICAL_RE.test(t)) return "critical" as const;
    if (CAUTION_RE.test(t)) return "caution" as const;
    if (POSITIVE_RE.test(t)) return "positive" as const;
    return "neutral" as const;
  };
  const toneColor: Record<string, string> = {
    positive: "000000",
    caution: "000000",
    critical: "000000",
    neutral: "000000",
  };

  const sentences: string[] = [];
  const purpose = S2((_form as any)?.purposeOfFieldVisit) || S2((_form as any)?.status);
  const location = S2((_form as any)?.location);
  const date = S2((_form as any)?.inspectionDate);
  if (purpose || location || date) {
    const inspect = purpose ? `${purpose} inspection` : "Site inspection";
    const place = location ? ` at ${location}` : "";
    const when = date ? ` on ${date}` : "";
    sentences.push(`${inspect}${place}${when}.`);
  }
  if (S2((_form as any)?.inspectorName) || S2((_form as any)?.companyName)) {
    const inspector = S2((_form as any)?.inspectorName) || "The assigned inspector";
    const company = S2((_form as any)?.companyName) ? ` for ${S2((_form as any)?.companyName)}` : "";
    sentences.push(`${inspector}${company} documented the site conditions and progress.`);
  }
  if (S2((_form as any)?.scheduleCompliance)) sentences.push(`Schedule status: ${S2((_form as any)?.scheduleCompliance)}.`);
  if (S2((_form as any)?.safetyCompliance)) sentences.push(`Safety compliance: ${S2((_form as any)?.safetyCompliance)}.`);
  if (S2((_form as any)?.materialAvailability)) sentences.push(`Material availability: ${S2((_form as any)?.materialAvailability)}.`);
  if (S2((_form as any)?.inspectorSummary)) sentences.push(`Inspector notes: ${S2((_form as any)?.inspectorSummary)}.`);

  const opsRaw = [
    { label: "Worker Attendance", value: S2((_form as any)?.workerAttendance) },
    { label: "Schedule Compliance", value: S2((_form as any)?.scheduleCompliance) },
    { label: "Material Availability", value: S2((_form as any)?.materialAvailability) },
    { label: "Safety Protocols", value: S2((_form as any)?.safetyCompliance) },
    { label: "Safety Signage", value: S2((_form as any)?.safetySignage) },
    { label: "Equipment Condition", value: S2((_form as any)?.equipmentCondition) },
  ].filter((x) => S2(x.value) !== "");

  const actions: string[] = [];
  if (S2((_form as any)?.recommendations)) actions.push(`Recommended actions: ${S2((_form as any)?.recommendations)}.`);
  if (S2((_form as any)?.additionalComments)) actions.push(`Additional comments: ${S2((_form as any)?.additionalComments)}.`);
  if (S2((_form as any)?.workerAttendance)) actions.push(`Worker attendance: ${S2((_form as any)?.workerAttendance)}.`);

  const infoRows: { label: string; value: string }[] = [];
  if (S2((_form as any)?.status)) infoRows.push({ label: "Status", value: S2((_form as any)?.status) });
  if (S2((_form as any)?.reportId)) infoRows.push({ label: "Report ID", value: S2((_form as any)?.reportId) });
  if (S2((_form as any)?.inspectorName)) infoRows.push({ label: "Inspector", value: S2((_form as any)?.inspectorName) });
  if (S2((_form as any)?.clientName)) infoRows.push({ label: "Client", value: S2((_form as any)?.clientName) });
  if (S2((_form as any)?.inspectionDate)) infoRows.push({ label: "Date", value: S2((_form as any)?.inspectionDate) });
  if (S2((_form as any)?.location)) infoRows.push({ label: "Location", value: S2((_form as any)?.location) });

  const weatherRows: { label: string; value: string }[] = [];
  if (S2((_form as any)?.temperature)) weatherRows.push({ label: "Temperature", value: `${S2((_form as any)?.temperature)} deg C` });
  if (S2((_form as any)?.humidity)) weatherRows.push({ label: "Humidity", value: `${S2((_form as any)?.humidity)}%` });
  if (S2((_form as any)?.windSpeed)) weatherRows.push({ label: "Wind", value: `${S2((_form as any)?.windSpeed)} km/h` });
  if (S2((_form as any)?.weatherDescription)) weatherRows.push({ label: "Conditions", value: S2((_form as any)?.weatherDescription) });

  const children: any[] = [];
  // Title
  children.push(new Paragraph({ text: "Auto Summary", heading: HeadingLevel.TITLE }));

  // Summary sentences box
  if (sentences.length) {
    children.push(new Paragraph({ text: sentences[0] }));
    for (let i = 1; i < sentences.length; i++) {
      children.push(new Paragraph({ text: sentences[i] }));
    }
  } else {
    children.push(new Paragraph({ text: "No summary data available yet." }));
  }

  // Operations Status grid (3 columns via table)
  if (opsRaw.length) {
    children.push(new Paragraph({ text: "Operations Status", heading: HeadingLevel.HEADING_2 }));
    const rows: any[] = [];
    for (let i = 0; i < opsRaw.length; i += 3) {
      const slice = opsRaw.slice(i, i + 3);
      const cells = slice.map((m) => new TableCell({
        children: [
          new Paragraph({ children: [ new TextRun({ text: m.label + ": ", bold: true }) ] }),
          new Paragraph({ children: [ new TextRun({ text: m.value, color: toneColor[tone(m.value)] }) ] }),
        ],
      }));
      while (cells.length < 3) cells.push(new TableCell({ children: [new Paragraph({ text: "" })] }));
      rows.push(new TableRow({ children: cells }));
    }
    children.push(new Table({ rows }));
  }

  // Highlights & Actions
  if (actions.length) {
    children.push(new Paragraph({ text: "Highlights & Actions", heading: HeadingLevel.HEADING_2 }));
    for (const a of actions) children.push(new Paragraph({ text: "• " + a }));
  }

  // Report Information and Weather Snapshot
  if (infoRows.length) {
    children.push(new Paragraph({ text: "Report Information", heading: HeadingLevel.HEADING_2 }));
    const infoTableRows = infoRows.map((r) => new TableRow({ children: [
      new TableCell({ children: [ new Paragraph({ children: [ new TextRun({ text: r.label + ":", bold: true }) ] }) ] }),
      new TableCell({ children: [ new Paragraph({ text: r.value }) ] }),
    ] }));
    children.push(new Table({ rows: infoTableRows }));
  }
  if (weatherRows.length) {
    children.push(new Paragraph({ text: "Weather Snapshot", heading: HeadingLevel.HEADING_2 }));
    const wRows = weatherRows.map((r) => new TableRow({ children: [
      new TableCell({ children: [ new Paragraph({ children: [ new TextRun({ text: r.label + ":", bold: true }) ] }) ] }),
      new TableCell({ children: [ new Paragraph({ text: r.value }) ] }),
    ] }));
    children.push(new Table({ rows: wRows }));
  }

  // Summary Photos
  const photos = _summaryPhotos || [];
  if (photos.length) {
    children.push(new Paragraph({ text: "Summary Photos", heading: HeadingLevel.HEADING_2 }));
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      children.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${p.caption || p.name || "Photo"}`, bold: true })] }));
      let dataUrl = p.data;
      if (dataUrl && dataUrl.startsWith("http")) {
        try { const d = await fetchToDataURL(dataUrl); if (d) dataUrl = d; } catch {}
      }
      if (dataUrl && dataUrl.startsWith("data:")) {
        const buf = dataUrlToUint8Array(dataUrl);
        //@ts-ignore
        if (buf.length) children.push(new Paragraph({ children: [ new ImageRun({ data: buf, transformation: { width: 520, height: 320 } }) ] }));
      }
    }
  }

  // Proof line
  

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `ninekiwi_summary_${S(_form.reportId) || "report"}.docx`);
}

// Simple adapter for AutoSummary component to export PDF
export async function generateAutoSummaryPDF(form: any, photos: any[]): Promise<void> {
  const mapped: PhotoData[] = (photos || []).map((p) => ({ name: p.name || "Photo", data: p.data, includeInSummary: true, caption: p.caption, description: p.description }));

  // Build Auto Summary content to mirror the UI
  const S2 = (v: unknown) => (v == null ? "" : String(v).trim());
  const nonEmpty = (v: unknown) => S2(v) !== "";

  const POSITIVE_RE = /(on track|compliant|available|complete|good|clear|safe|yes|ok|met|satisfactory|no issues|adequate)/i;
  const CAUTION_RE = /(monitor|pending|partial|limited|follow up|minor|in progress|ongoing|watch)/i;
  const CRITICAL_RE = /(delay|behind|blocked|risk|hazard|unsafe|critical|stop|halt|fail|shortage|defect|non-?compliant|incident|accident|escalate|breach)/i;
  const tone = (txt?: string) => {
    const t = S2(txt);
    if (!t) return "neutral";
    if (CRITICAL_RE.test(t)) return "critical";
    if (CAUTION_RE.test(t)) return "caution";
    if (POSITIVE_RE.test(t)) return "positive";
    return "neutral";
  };

  const sentences: string[] = [];
  const purpose = S2((form as any)?.purposeOfFieldVisit) || S2((form as any)?.status);
  const location = S2((form as any)?.location);
  const date = todayStr((form as any)?.inspectionDate);
  if (purpose || location || date) {
    const inspect = purpose ? `${purpose} inspection` : "Site inspection";
    const place = location ? ` at ${location}` : "";
    const when = date ? ` on ${date}` : "";
    sentences.push(`${inspect}${place}${when}.`);
  }
  if (nonEmpty((form as any)?.inspectorName) || nonEmpty((form as any)?.companyName)) {
    const inspector = S2((form as any)?.inspectorName) || "The assigned inspector";
    const company = S2((form as any)?.companyName) ? ` for ${S2((form as any)?.companyName)}` : "";
    sentences.push(`${inspector}${company} documented the site conditions and progress.`);
  }
  if (nonEmpty((form as any)?.scheduleCompliance)) sentences.push(`Schedule status: ${S2((form as any)?.scheduleCompliance)}.`);
  if (nonEmpty((form as any)?.safetyCompliance)) sentences.push(`Safety compliance: ${S2((form as any)?.safetyCompliance)}.`);
  if (nonEmpty((form as any)?.materialAvailability)) sentences.push(`Material availability: ${S2((form as any)?.materialAvailability)}.`);
  if (nonEmpty((form as any)?.inspectorSummary)) sentences.push(`Inspector notes: ${S2((form as any)?.inspectorSummary)}.`);

  const opsRaw = [
    { label: "Worker Attendance", value: S2((form as any)?.workerAttendance) },
    { label: "Schedule Compliance", value: S2((form as any)?.scheduleCompliance) },
    { label: "Material Availability", value: S2((form as any)?.materialAvailability) },
    { label: "Safety Protocols", value: S2((form as any)?.safetyCompliance) },
    { label: "Safety Signage", value: S2((form as any)?.safetySignage) },
    { label: "Equipment Condition", value: S2((form as any)?.equipmentCondition) },
  ].filter((x) => nonEmpty(x.value));

  const actions: string[] = [];
  if (nonEmpty((form as any)?.recommendations)) actions.push(`Recommended actions: ${S2((form as any)?.recommendations)}.`);
  if (nonEmpty((form as any)?.additionalComments)) actions.push(`Additional comments: ${S2((form as any)?.additionalComments)}.`);
  if (nonEmpty((form as any)?.workerAttendance)) actions.push(`Worker attendance: ${S2((form as any)?.workerAttendance)}.`);

  const infoRows: { label: string; value: string }[] = [];
  if (nonEmpty((form as any)?.status)) infoRows.push({ label: "Status", value: S2((form as any)?.status) });
  if (nonEmpty((form as any)?.reportId)) infoRows.push({ label: "Report ID", value: S2((form as any)?.reportId) });
  if (nonEmpty((form as any)?.inspectorName)) infoRows.push({ label: "Inspector", value: S2((form as any)?.inspectorName) });
  if (nonEmpty((form as any)?.clientName)) infoRows.push({ label: "Client", value: S2((form as any)?.clientName) });
  if (nonEmpty((form as any)?.inspectionDate)) infoRows.push({ label: "Date", value: S2((form as any)?.inspectionDate) });
  if (nonEmpty((form as any)?.location)) infoRows.push({ label: "Location", value: S2((form as any)?.location) });

  const weatherRows: { label: string; value: string }[] = [];
  if (nonEmpty((form as any)?.temperature)) weatherRows.push({ label: "Temperature", value: `${S2((form as any)?.temperature)} deg C` });
  if (nonEmpty((form as any)?.humidity)) weatherRows.push({ label: "Humidity", value: `${S2((form as any)?.humidity)}%` });
  if (nonEmpty((form as any)?.windSpeed)) weatherRows.push({ label: "Wind", value: `${S2((form as any)?.windSpeed)} km/h` });
  if (nonEmpty((form as any)?.weatherDescription)) weatherRows.push({ label: "Conditions", value: S2((form as any)?.weatherDescription) });

  // Build first page (summary)
  const summaryHTML = `
    <div class="nk-page">
      ${headerBar(form)}
      <div class="nk-block-title">Auto Summary</div>
      <div class="nk-intro">
        <div style="background:#fff; padding:5mm; border-left:0; border-radius:0;">
          ${(sentences.length ? sentences : ["No summary data available yet."]).map((s) => `<p class=\"nk-p nk-muted\">${s}</p>`).join("")}
        </div>
      </div>

      ${opsRaw.length ? `
      <div class="nk-card" style="page-break-inside: avoid;">
        <h3>Operations Status</h3>
        <div class="nk-sum-grid-3">
          ${opsRaw.map((m) => {
            const t = tone(m.value);
            return `<div><div class=\"nk-meta\" style=\"margin-bottom:2mm;\">${m.label}</div><span class=\"nk-badge nk-badge-${t}\">${m.value}</span></div>`;
          }).join("")}
        </div>
      </div>` : ""}

      ${(actions.length) ? `
      <div class="nk-card" style="page-break-inside: avoid;">
        <h3>Highlights & Actions</h3>
        <ul style="margin:0; padding-left:5mm;">
          ${actions.map((a) => `<li class=\"nk-p\">${a}</li>`).join("")}
        </ul>
      </div>` : ""}

      ${(infoRows.length || weatherRows.length) ? `
      <div class="nk-card" style="page-break-inside: avoid;">
        ${infoRows.length ? `
          <h3>Report Information</h3>
          <table class=\"nk-table\"><tbody>
            ${infoRows.map((r) => `<tr><td style=\"width:40%;\"><b>${r.label}</b></td><td class=\"nk-meta\">${r.value}</td></tr>`).join("")}
          </tbody></table>
        ` : ""}
        ${weatherRows.length ? `
          <h3 style=\"margin-top:4mm;\">Weather Snapshot</h3>
          <table class=\"nk-table\"><tbody>
            ${weatherRows.map((r) => `<tr><td style=\"width:40%;\"><b>${r.label}</b></td><td class=\"nk-meta\">${r.value}</td></tr>`).join("")}
          </tbody></table>
        ` : ""}
      </div>` : ""}

      ${footerBar()}
    </div>
  `;

  // Photos page(s)
  const photosHTML = mapped.length ? photoPages(form, "Summary Photos", mapped, 1, "") : "";

  const html = summaryHTML + photosHTML;

  const cleanup = mount(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const nameBase =
      (S(form.reportId) || S(form.clientName) || S(form.location) || "summary")
        .replace(/[^\w.-]+/g, "_") || "summary";
    await renderRootToPDF(root, `ninekiwi_summary_${nameBase}_${dateStr}.pdf`);
  } finally {
    cleanup();
  }
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
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, Table, TableRow, TableCell } = await import("docx");
  //@ts-ignore
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
    //@ts-ignore
    return new ImageRun({ data: buf, transformation: { width: 520, height: 320 } });
  }

  const children: any[] = [];
  const purposeDoc = S((form as any).purposeOfFieldVisit); const normalizedDoc = purposeDoc ? purposeDoc.toUpperCase() : ""; const coverTitleDoc = normalizedDoc ? (normalizedDoc.endsWith(" REPORT") ? normalizedDoc : `${normalizedDoc} REPORT`) : "CONSTRUCTION PROGRESS REPORT"; children.push(new Paragraph({ text: coverTitleDoc, heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: `${S(form.companyName)} | ${S(form.location)} | ${S(form.inspectionDate)}` })); children.push(new Paragraph({ text: `Prepared for: Owner` })); children.push(new Paragraph({ text: `Prepared by: ${S(form.inspectorName) || "Inspector"}` }));

  // Optional site map as first image section (auto-generate if not provided)
  let siteMapDoc = siteMap;
  if (!siteMapDoc) {
    try { siteMapDoc = await buildSiteMapFromForm(form); } catch {}
  }
  if (siteMapDoc) {
    const img = await toImageRun(siteMapDoc);
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
    kv("All safety protocols & PPE followed?", S(form.safetyCompliance)),
    kv("Safety signage & access control in place?", S(form.safetySignage)),
    kv("All workers present & on time?", S(form.workerAttendance)),
    kv("Progress vs schedule", S(form.scheduleCompliance)),
    kv("Materials available & usable?", S(form.materialAvailability)),
    kv("Current work progress", S(form.workProgress)),
  ].forEach((p) => { if (p) children.push(p); });

  // 2. Background (manual + auto + photos)
  const bgAutoWord = S(form.backgroundAuto) || autoBackground(form, sectionPhotos.background?.length ? sectionPhotos.background : sectionPhotos.fieldObservation || []);
  if (S(form.backgroundManual) || bgAutoWord) {
    children.push(new Paragraph({ text: "2. Background", heading: HeadingLevel.HEADING_2 }));
    if (S(form.backgroundManual)) children.push(new Paragraph({ text: S(form.backgroundManual) }));
    if (bgAutoWord) {
      const plain = bgAutoWord.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      children.push(new Paragraph({ text: plain }));
    }
    const bgPhotos = sectionPhotos.background || [];
    if (bgPhotos.length) {
      for (const ph of bgPhotos) {
        const ir = await toImageRun(ph);
        if (ir) {
          children.push(new Paragraph({ children: [ir] }));
          if (ph.caption) children.push(new Paragraph({ text: ph.caption }));
          if (ph.description) children.push(new Paragraph({ text: ph.description }));
        }
      }
    }
  }

  // 3. Field Observation (intro + photos)
  children.push(new Paragraph({ text: "3. Field Observation", heading: HeadingLevel.HEADING_2 }));
  if (S(form.fieldObservationText)) children.push(new Paragraph({ text: S(form.fieldObservationText) }));
  const foPhotos = sectionPhotos.fieldObservation || [];
  if (foPhotos.length) {
    for (const ph of foPhotos) {
      const ir = await toImageRun(ph);
      if (ir) {
        children.push(new Paragraph({ children: [ir] }));
        if (ph.caption) children.push(new Paragraph({ text: ph.caption }));
        if (ph.description) children.push(new Paragraph({ text: ph.description }));
      }
    }
  }

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
  
  // Additional Images (optional) - after Field Observation
  const addPhotos = sectionPhotos.additional || [];
  if (addPhotos.length) {
    children.push(new Paragraph({ text: "Additional Images (optional)", heading: HeadingLevel.HEADING_2 }));
    for (const ph of addPhotos) {
      const ir = await toImageRun(ph);
      if (ir) {
        children.push(new Paragraph({ children: [ir] }));
        if (ph.caption) children.push(new Paragraph({ text: ph.caption }));
        if (ph.description) children.push(new Paragraph({ text: ph.description }));
      }
    }
  }

  // Inspection Support Equipment (if any) - last before conclusion
  const eqPhotos = sectionPhotos.equipment || [];
  if (eqPhotos.length) {
    children.push(new Paragraph({ text: "Inspection Support Equipment (if any)", heading: HeadingLevel.HEADING_2 }));
    for (const ph of eqPhotos) {
      const ir = await toImageRun(ph);
      if (ir) {
        children.push(new Paragraph({ children: [ir] }));
        if (ph.caption) children.push(new Paragraph({ text: ph.caption }));
        if (ph.description) children.push(new Paragraph({ text: ph.description }));
      }
    }
  }

  // 4. Conclusion (to match PDF)
  children.push(new Paragraph({ text: "4. Conclusion", heading: HeadingLevel.HEADING_2 }));
  const partsDoc: string[] = [];
  if (S(form.status)) partsDoc.push(`Overall status: ${S(form.status)}.`);
  if (S(form.scheduleCompliance)) partsDoc.push(`Schedule: ${S(form.scheduleCompliance)}.`);
  if (S(form.materialAvailability)) partsDoc.push(`Materials: ${S(form.materialAvailability)}.`);
  if (S(form.safetyCompliance)) partsDoc.push(`Safety: ${S(form.safetyCompliance)}.`);
  const baseDoc = partsDoc.length ? partsDoc.join(" ") : "No critical blockers observed at the time of inspection. Continue to monitor schedule, safety, and materials.";
  children.push(new Paragraph({ text: baseDoc }));
  if (S(form.additionalComments)) children.push(new Paragraph({ text: `Notes & Recommendations: ${S(form.additionalComments)}` }));
  if (S(form.inspectorSummary)) children.push(new Paragraph({ text: `Inspector's Summary: ${S(form.inspectorSummary)}` }));
  if (S(form.recommendations)) children.push(new Paragraph({ text: `Recommended Actions: ${S(form.recommendations)}` }));
if (signatureData && signatureData.startsWith("data:")) {
    const sigBuf = dataUrlToUint8Array(signatureData);
    if (sigBuf.length) {
      children.push(new Paragraph({ text: "Signature of Inspector", heading: HeadingLevel.HEADING_2 }));
      //@ts-ignore
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