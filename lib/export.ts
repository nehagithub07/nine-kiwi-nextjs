/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { jsPDF as JsPDFType } from "jspdf";

/* =========================
   TYPES
   ========================= */
export interface PhotoData {
  name: string;
  data: string;
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
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  lat?: string | number;
  lon?: string | number;
  address?: AddressData;
  status?: string;
  reportId?: string;
  inspectorName?: string;
  inspector?: string;
  supervisorName?: string;
  clientName?: string;
  contractorName?: string;
  contactPhone?: string;
  contactEmail?: string;
  impactRating?: string | number;
  startInspectionTime?: string;
  companyLogo?: string;
  inspectionDate?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;
  safetyCompliance?: string;
  workProgress?: string;
  additionalComments?: string;
  inspectorDesignation?: string;
  inspectorId?: string;
  supervisorDesignation?: string;
  clientId?: string;
  signatureData?: string;
}

interface Html2CanvasOptions {
  scale: number;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string;
  logging: boolean;
  imageTimeout: number;
  scrollX: number;
  scrollY: number;
  windowWidth: number;
  windowHeight: number;
}

/* =========================
   PRINT CSS (stable, stacked)
   ========================= */
const SAFE_PRINT_CSS = `
@page { size: A4; margin: 0; }
.nk-print, .nk-print * {
  color: #1A202C !important;
  box-sizing: border-box !important;
  font-family: 'Inter','Segoe UI',Tahoma,sans-serif;
  line-height: 1.5;
  font-size: 11pt;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.nk-page {
  width: 210mm; min-height: 297mm; padding: 15mm;
  margin: 0 auto; background: #fff; position: relative;
  page-break-after: always; box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.nk-page:last-child { page-break-after: auto; }

/* COVER */
.nk-cover-header{padding:20px 0;border-bottom:3px solid #78C850;margin-bottom:40px;background:#F7FAFC;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.nk-cover-company{font-size:12pt;font-weight:700;color:#2D3748;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
.nk-cover-address{font-size:10pt;color:#4A5568;line-height:1.6}
.nk-cover-title-wrapper{text-align:center;margin:60px 0 50px;padding:30px 20px;background:#78C850;border-radius:12px;box-shadow:0 8px 24px rgba(120,200,80,.2)}
.nk-cover-title{font-size:24pt;font-weight:800;color:#fff;margin-bottom:15px;letter-spacing:.3px;text-shadow:1px 1px 4px rgba(0,0,0,.1)}
.nk-cover-subtitle{font-size:14pt;color:#F7FAFC;font-weight:500;padding:10px 20px;border-radius:6px;display:inline-block}
.nk-cover-date{text-align:right;margin:50px 0 60px;font-size:10pt;color:#2D3748;font-weight:500;padding:12px 20px;background:#EDF2F7;border-left:4px solid #78C850;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.nk-cover-credits{position:absolute;right:15mm;bottom:50mm;text-align:right}
.nk-cover-credit-block{margin-bottom:25px;padding:15px 20px;background:#fff;border-radius:8px;border-right:4px solid #78C850;box-shadow:0 4px 12px rgba(0,0,0,.06)}
.nk-cover-credit-label{font-size:9pt;color:#718096;margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:.6px}
.nk-cover-credit-name{font-size:12pt;font-weight:600;color:#1A202C}

/* DISCLAIMER */
.nk-disclaimer-wrapper{padding:50mm 15mm;background:#F7FAFC;border-radius:12px;box-shadow:inset 0 0 20px rgba(120,200,80,.05);position:relative;margin:30mm 0}
.nk-disclaimer-wrapper::before{content:'';position:absolute;top:0;left:0;right:0;height:6px;background:#78C850;border-radius:12px 12px 0 0}
.nk-disclaimer-title{font-size:18pt;font-weight:700;color:#2D3748;text-align:center;margin-bottom:25px;padding-bottom:15px;border-bottom:2px solid #78C850}
.nk-disclaimer-text{font-size:11pt;color:#2D3748;text-align:justify;line-height:1.8;padding:20px 30px;background:#fff;border-radius:8px;border-left:4px solid #78C850;box-shadow:0 2px 8px rgba(0,0,0,.04)}

/* TOC */
.nk-toc-wrapper{padding-top:40mm}
.nk-toc-title{font-size:20pt;font-weight:800;color:#1A202C;margin-bottom:35px;padding-bottom:20px;border-bottom:4px solid #78C850;position:relative;padding-left:15px}
.nk-toc-title::before{content:'';position:absolute;left:0;top:0;bottom:20px;width:6px;background:#78C850;border-radius:3px}
.nk-toc-item{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;margin-bottom:8px;border-radius:8px;background:#F7FAFC;border-left:4px solid #E2E8F0;transition:all .2s ease;box-shadow:0 1px 4px rgba(0,0,0,.03)}
.nk-toc-item:hover{border-left-color:#78C850;box-shadow:0 2px 8px rgba(120,200,80,.15)}
.nk-toc-number{font-weight:700;font-size:12pt;color:#78C850;margin-right:12px;min-width:25px}
.nk-toc-text{flex:1;font-size:11pt;color:#2D3748;font-weight:500}

/* SECTIONS */
.nk-print-section{margin:20px 0;page-break-inside:avoid}
.nk-print-section-title{font-size:18px;font-weight:700;color:#2D3748;margin-bottom:15px;padding:12px 18px 12px 20px;background:#F7FAFC;border-left:5px solid #78C850;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.nk-print-content{font-size:11pt;line-height:1.7;color:#4A5568;padding:12px 18px}

/* CENTER ONLY OUR PARAGRAPHS */
.nk-center-paragraph{ text-align:center; margin-left:auto; margin-right:auto; }

/* META GRID */
.nk-print-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0;padding:18px;background:#F7FAFC;border-radius:12px;border-left:5px solid #78C850;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.nk-print-meta-item{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:14px;text-align:center}
.nk-print-meta-label{display:block;font-size:8.5pt;font-weight:700;text-transform:uppercase;color:#718096;letter-spacing:.6px;margin-bottom:6px}
.nk-print-meta-value{display:block;font-size:12pt;font-weight:600;color:#2D3748;line-height:1.4}

/* TABLES */
.nk-print-table{width:100%;border-collapse:collapse;margin-top:12px;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.nk-print-table th,.nk-print-table td{padding:10px 12px;border:1px solid #E2E8F0;text-align:left;vertical-align:top;font-size:10pt}
.nk-print-table thead th{background:#78C850;font-weight:600;color:#fff;border-bottom:2px solid #5FA838;text-transform:uppercase;letter-spacing:.4px;font-size:9pt}
.nk-print-table tbody tr:nth-child(even){background:#F8FAFC}
.nk-print-table tbody tr:hover{background:#EDF2F7}

/* PHOTOS – reduced size + safer spacing */
.nk-print-photo-grid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:12px}
.nk-print-photo-item{page-break-inside:avoid;background:#fff;border-radius:12px;padding:16px;box-shadow:0 3px 12px rgba(0,0,0,.07);border:1px solid #E2E8F0;break-inside:avoid;margin-bottom:4px}
.nk-photo-display-row{display:block;width:100%;margin-bottom:10px}
.nk-photo-image-cell{display:block;width:100%;padding-right:0;margin-bottom:12px}
.nk-photo-info-cell{display:block;width:100%;padding-left:0;border-left:none;border-top:2px solid #78C850;padding-top:14px;margin-top:2px}
.nk-imgwrap{background:#F7FAFC;border-radius:12px;padding:10px;border:1px solid #E2E8F0;box-shadow:0 2px 8px rgba(0,0,0,.06);break-inside:avoid}
.nk-imgwrap img{
  display:block !important;
  visibility:visible !important;
  width:95%;
  max-width:95%;
  height:auto;
  max-height:300px;          /* reduced from 350px */
  object-fit:contain;
  margin:0 auto;             /* center image in card */
  background:#fff;
  border-radius:8px;
  border:2px solid #fff;
  box-shadow:0 2px 10px rgba(0,0,0,.07);
  page-break-inside:avoid;break-inside:avoid
}
.nk-caption-wrapper{margin-bottom:10px}
.nk-caption-label{font-size:9pt;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;padding:6px 10px;background:#F7FAFC;border-radius:4px;border-left:3px solid #78C850}
.nk-caption-text{font-size:12pt;color:#1A202C;font-weight:600;line-height:1.45;padding:8px 10px;background:#fff;border-radius:6px;border:1px solid #E2E8F0;word-break:break-word;overflow-wrap:anywhere}
.nk-description-wrapper{margin-top:8px}
.nk-description-label{font-size:9pt;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;padding:6px 10px;background:#F7FAFC;border-radius:4px;border-left:3px solid #5FA838}
.nk-description-text{font-size:10pt;color:#4A5568;line-height:1.65;padding:10px;background:#fff;border:1px solid #E2E8F0;border-radius:6px;text-align:justify;word-break:break-word;overflow-wrap:anywhere}

/* MAP – reduced max-height a bit */
.nk-map{background:#F7FAFC;border-radius:12px;padding:12px;border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.08)}
.nk-map img{width:100%;min-height:240px;max-height:320px;object-fit:cover;border-radius:10px;border:3px solid #fff;display:block!important;box-shadow:0 2px 12px rgba(0,0,0,.08)}

/* FOOTER panel (visual only; the actual text line is drawn by jsPDF) */
.nk-print-footer{margin-top:30px;padding-top:18px;border-top:2px solid #78C850;text-align:center;position:absolute;bottom:15mm;left:15mm;right:15mm;background:#F7FAFC;padding:15px;border-radius:8px}
.nk-print-footer-brand{font-weight:700;font-size:12pt;color:#2D3748;margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px}
.nk-print-footer-text{font-size:8pt;color:#718096;line-height:1.5;margin-bottom:6px}
.nk-print-footer-contact{font-size:9pt;color:#4A5568;font-weight:500}
`;

/* =========================
   UTILS
   ========================= */
function sanitizeText(input: unknown): string {
  if (input == null) return "";
  let text = String(input).trim();
  text = text.replace(/\b(refse|weafwe|ERFARF|lorem ipsum(?:[^.]*)?)\b/gi, "");
  text = text.replace(/\bimage\.jpg\b/gi, "Photo evidence");
  text = text.replace(/\bN\/A\b/g, "Not applicable");
  text = text.replace(/\bYes\b(?!\s*\()/g, "Yes (confirmed)");
  text = text.replace(/\bNo\b(?!\s*\()/g, "No (not observed)");
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function impactLabel(raw: unknown): string {
  if (raw == null) return "";
  const n = String(raw).toLowerCase().trim();
  if (/^(3|high|h)$/.test(n)) return "High";
  if (/^(2|medium|med|m)$/.test(n)) return "Medium";
  if (/^(1|low|l)$/.test(n)) return "Low";
  return sanitizeText(raw);
}

function formatTime(time?: string): string {
  if (!time) return "—";
  try {
    const d = new Date(`2000-01-01T${time}`);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return time;
  }
}

function formatAddressFromSplit(form: FormData): string {
  const parts = [
    form.streetAddress,
    [form.city, form.state].filter(Boolean).join(", "),
    [form.country, form.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0);
  return sanitizeText(parts.join(" • "));
}

function formatAddressFromObject(address?: AddressData): string {
  if (!address) return "";
  const parts = [
    address.street,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.country, address.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0);
  return sanitizeText(parts.join(" • "));
}

function getReportTitle(form: FormData): string {
  const base = sanitizeText(form.status) || sanitizeText(form.reportId) || sanitizeText(form.location) || "inspection";
  return base;
}
function getFilenameBase(form: FormData): string {
  return getReportTitle(form).replace(/[^\w.-]+/g, "_");
}

function mountTemp(html: string): () => void {
  const container = document.createElement("div");
  container.className = "nk-print";
  const styleElement = document.createElement("style");
  styleElement.textContent = SAFE_PRINT_CSS;
  container.appendChild(styleElement);
  const content = document.createElement("div");
  content.innerHTML = html;
  container.appendChild(content);
  document.body.appendChild(container);
  return () => container.parentNode?.removeChild(container);
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) return resolve();
          const done = () => resolve();
          const to = setTimeout(done, 20000);
          img.onload = () => { clearTimeout(to); resolve(); };
          img.onerror = () => { clearTimeout(to); resolve(); };
          if (img.src && !img.complete) {
            const s = img.src; img.src = ""; img.src = s;
          }
        })
    )
  );
}

async function renderNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  const options: Partial<Html2CanvasOptions> = {
    scale: 3, useCORS: true, allowTaint: false, backgroundColor: "#ffffff",
    logging: false, imageTimeout: 30000, scrollX: 0, scrollY: 0,
    windowWidth: Math.max(node.scrollWidth, node.clientWidth),
    windowHeight: Math.max(node.scrollHeight, node.clientHeight),
  };
  return await html2canvas(node, options);
}

function canvasToDataUrlSafe(canvas: HTMLCanvasElement): { data: string; type: "PNG" | "JPEG" } {
  try {
    const png = canvas.toDataURL("image/png", 1.0);
    if (png.startsWith("data:image/png")) return { data: png, type: "PNG" };
  } catch {}
  const jpg = canvas.toDataURL("image/jpeg", 0.98);
  return { data: jpg, type: "JPEG" };
}

async function fetchToDataURL(url: string): Promise<string> {
  if (!url || url.startsWith("data:")) return url;

  const toDataURL = async (resp: Response) => {
    if (!resp.ok) throw new Error(String(resp.status));
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  };

  try {
    const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied, { cache: "no-store" });
    return await toDataURL(res);
  } catch (e1) {
    console.warn("[image-proxy] failed, trying weserv →", e1);
  }
  try {
    const weserv = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ""))}`;
    const res = await fetch(weserv, { mode: "cors", cache: "no-cache" });
    return await toDataURL(res);
  } catch (e2) {
    console.warn("[weserv] failed, trying corsproxy →", e2);
  }
  try {
    const corsproxy = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(corsproxy, { mode: "cors", cache: "no-cache" });
    return await toDataURL(res);
  } catch (e3) {
    console.error("[corsproxy] failed → giving up", e3);
    throw new Error("Failed to fetch image via all proxies");
  }
}

/* =========================
   CONTENT BUILDERS
   ========================= */
async function buildMapBlock(form: FormData): Promise<string> {
  const latStr = String(form.lat ?? "").trim();
  const lonStr = String(form.lon ?? "").trim();
  const lat = Number(latStr);
  const lon = Number(lonStr);
  const hasCoords = latStr !== "" && lonStr !== "" && Number.isFinite(lat) && Number.isFinite(lon);

  const addressText =
    formatAddressFromSplit(form) || formatAddressFromObject(form.address) || sanitizeText(form.location) || "";

  const key = process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY;
  let mapURL = "";
  if (key) {
    mapURL = hasCoords
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=1200x600&scale=2&maptype=roadmap&markers=color:0x78C850%7C${lat},${lon}&style=feature:poi%7Cvisibility:simplified&key=${key}`
      : `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(addressText)}&zoom=15&size=1200x600&scale=2&maptype=roadmap&markers=color:0x78C850%7C${encodeURIComponent(addressText)}&style=feature:poi%7Cvisibility:simplified&key=${key}`;
  } else {
    mapURL = hasCoords
      ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=1200x600&markers=${lat},${lon},lightgreen1`
      : `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(addressText)}&zoom=15&size=1200x600&markers=${encodeURIComponent(addressText)},lightgreen1`;
  }

  const imgData = await fetchToDataURL(mapURL);

  return `
    <div class="nk-print-photo-item">
      <div class="nk-map">
        <img src="${imgData}" alt="Site Location Map" loading="eager" />
      </div>
      <div style="margin-top:12px; padding:12px; background:#F7FAFC; border-radius:8px; border-left:4px solid #78C850; text-align:center;">
        <div style="font-weight:700; font-size:10.5pt; color:#2D3748; margin-bottom:6px;">Figure 1. Site Location Map</div>
        <div style="font-size:9.5pt; color:#4A5568;"><strong>Location:</strong> ${
          hasCoords ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` : addressText || "—"
        }</div>
      </div>
    </div>
  `;
}

function enrichSummaryHTML(autoSummary: string): string {
  const cleaned = sanitizeText(autoSummary);
  if (!cleaned || cleaned.length < 80) {
    return `<div class="nk-print-content">
      <ul style="margin-top:10px; padding-left:18px; line-height:1.8;">
        <li><strong>Risks Identified:</strong> Detailed in inspection sections</li>
        <li><strong>Immediate Corrective Actions:</strong> See recommendations</li>
        <li><strong>Next Steps & Owners:</strong> Assigned per section</li>
        <li><strong>Schedule Position:</strong> Current status documented</li>
      </ul>
    </div>`;
  }
  return `<div class="nk-print-content">${cleaned}</div>`;
}

function buildAutoConclusion(form: FormData): string {
  const bits: string[] = [];
  const status = sanitizeText(form.status);
  const sched = sanitizeText(form.scheduleCompliance);
  const safety = sanitizeText(form.safetyCompliance);
  const materials = sanitizeText(form.materialAvailability);
  const work = sanitizeText(form.workProgress);
  const impact = impactLabel(form.impactRating);

  if (status) bits.push(`Overall project status is <strong>${status}</strong>.`);
  if (sched) bits.push(`Schedule alignment is <strong>${sched}</strong>.`);
  if (safety) bits.push(`Safety compliance is <strong>${safety}</strong>.`);
  if (materials) bits.push(`Material availability is <strong>${materials}</strong>.`);
  if (work) bits.push(`Work progress: ${work}.`);
  if (impact) bits.push(`Impact rating is assessed as <strong>${impact}</strong>.`);

  const summary =
    bits.length > 0
      ? bits.join(" ")
      : "Based on current observations, the project remains within expected parameters. No critical blockers were observed during this inspection window.";

  const recommendations = sanitizeText(form.additionalComments || "");
  return `
    <div class="nk-print-content">
      <h3 style="text-align:center;margin:0 0 8px 0;font-size:13pt;">Auto-generated Conclusion</h3>
      <p class="nk-center-paragraph">${summary}</p>
      ${
        recommendations
          ? `<p class="nk-center-paragraph" style="margin-top:12px;"><strong>Notes & Recommendations:</strong> ${recommendations}</p>`
          : ""
      }
      <p class="nk-center-paragraph" style="margin-top:12px;">Next report will revisit schedule alignment, safety adherence, and material sufficiency, with an emphasis on closing any open items.</p>
    </div>
  `;
}

/* Human-readable recap of what the report contains */
function buildContentConclusion(
  form: FormData,
  photosCount: number,
  extraCount: number
): string {
  const bits: string[] = [];
  const present = (label: string, val?: unknown) => (sanitizeText(val) ? label : "");

  const presentSections = [
    present("Schedule Compliance", form.scheduleCompliance),
    present("Material Availability", form.materialAvailability),
    present("Safety Compliance", form.safetyCompliance),
    present("Work Progress", form.workProgress),
    present("Additional Comments", form.additionalComments),
  ].filter(Boolean);

  if (presentSections.length) bits.push(`Covered sections: <strong>${presentSections.join(", ")}</strong>.`);

  const weatherBits: string[] = [];
  if (form.temperature) weatherBits.push(`${form.temperature}°C`);
  if (form.weatherDescription) weatherBits.push(String(form.weatherDescription));
  if (form.humidity) weatherBits.push(`Humidity ${form.humidity}%`);
  if (form.windSpeed) weatherBits.push(`Wind ${form.windSpeed} m/s`);
  if (weatherBits.length) bits.push(`Weather at site: ${weatherBits.join(" | ")}.`);

  if (photosCount + extraCount > 0) {
    bits.push(
      `Photo documentation: <strong>${photosCount}</strong> section photos${
        extraCount ? ` and <strong>${extraCount}</strong> additional images.` : `.`
      }`
    );
  }

  const summary = bits.length
    ? bits.join(" ")
    : "This report contains the site summary and standard inspection metadata.";

  return `
    <div class="nk-print-content">
      <h3 style="text-align:center;margin:0 0 8px 0;font-size:13pt;">Conclusion of Report Content</h3>
      <p class="nk-center-paragraph" style="margin-top:6px;">${summary}</p>
    </div>
  `;
}

/* FRONT PAGES */
async function buildFrontPages(form: FormData, toc: string[]): Promise<string> {
  const location = sanitizeText(form.location);
  const address = formatAddressFromSplit(form) || formatAddressFromObject(form.address);
  const who = sanitizeText(form.inspectorName || form.inspector);

  const cover = `
  <div class="nk-page">
    <div class="nk-cover-header">
      <div class="nk-cover-company">NINEKIWI INSPECTION COMPANY</div>
      <div class="nk-cover-address">
        ${sanitizeText(form.streetAddress) || "1 BRAN LANE"}, ${sanitizeText(form.city) || "NEW YORK"} ${sanitizeText(form.zipCode) || "10001"}<br/>
        TEL. NO. ${sanitizeText(form.contactPhone) || "(000) 000-0000"}
      </div>
    </div>
    <div class="nk-cover-title-wrapper">
      <h1 class="nk-cover-title">CONSTRUCTION PROGRESS REPORT</h1>
      <div class="nk-cover-subtitle">${location || address || "PROJECT LOCATION"}</div>
    </div>
    <div class="nk-cover-date">
      REPORT DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </div>
    <div class="nk-cover-credits">
      <div class="nk-cover-credit-block">
        <div class="nk-cover-credit-label">Prepared for:</div>
        <div class="nk-cover-credit-name">${sanitizeText(form.clientName) || "Client Name"}</div>
      </div>
      <div class="nk-cover-credit-block">
        <div class="nk-cover-credit-label">Prepared by:</div>
        <div class="nk-cover-credit-name">${who || "Inspector Name, PE"}</div>
      </div>
    </div>
  </div>`;

  const disclaimer = `
  <div class="nk-page">
    <div class="nk-disclaimer-wrapper">
      <h2 class="nk-disclaimer-title">DISCLAIMER & TERMS OF USE</h2>
      <p class="nk-disclaimer-text">
        This Report is intended solely for use by the Client in accordance with <strong>NineKiwi Inspection Company</strong> contract with the Client.
        While the Report may be provided to applicable authorities having jurisdiction and others for whom the Client is responsible, <strong>NineKiwi Inspection Company</strong>
        does not warrant the services to any third party. The report may not be relied upon by any other party without the express written consent of
        <strong>NineKiwi Inspection Company</strong>, which may be withheld at <strong>NineKiwi Inspection Company</strong> discretion.
        <br/><br/>
        All findings, observations, and recommendations contained herein are based on site conditions at the time of inspection and are subject to change.
        <strong>NineKiwi Inspection Company</strong> assumes no liability for conditions that may develop after the inspection date or for areas not
        accessible during the inspection. This report should be reviewed in its entirety, as partial review may lead to misinterpretation.
      </p>
    </div>
  </div>`;

  const tocItems = toc
    .map((t, i) => {
      return `<div class="nk-toc-item">
        <span class="nk-toc-number">${i + 1}.</span>
        <span class="nk-toc-text">${t}</span>
      </div>`;
    })
    .join("");

  const tocPage = `
  <div class="nk-page">
    <div class="nk-toc-wrapper">
      <h2 class="nk-toc-title">Table of Contents</h2>
      <div>${tocItems}</div>
    </div>
  </div>`;

  return cover + disclaimer + tocPage;
}

/* SUMMARY REPORT BODY (stacked) */
async function buildSummaryReportHTML(
  form: FormData,
  autoSummaryHTML: string,
  photos: PhotoData[],
  additionalPhotos: PhotoData[]
): Promise<string> {
  const status = sanitizeText(form.status);
  const reportId = sanitizeText(form.reportId);
  const inspector = sanitizeText(form.inspectorName || form.inspector);
  const supervisor = sanitizeText(form.supervisorName);
  const addressText = formatAddressFromSplit(form) || formatAddressFromObject(form.address);
  const impact = impactLabel(form.impactRating);
  const obsTime = formatTime(form.startInspectionTime);
  const weather =
    form.temperature || form.humidity || form.windSpeed || form.weatherDescription
      ? {
          temperature: Number(form.temperature || 0),
          humidity: Number(form.humidity || 0),
          windSpeed: Number(form.windSpeed || 0),
          condition: sanitizeText(form.weatherDescription),
        }
      : null;

  const mapBlock = await buildMapBlock(form);

  const page1 = `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">1. Site Location and Field Condition Summary</h2>
      <div class="nk-print-photo-grid">${mapBlock}</div>
      <table class="nk-print-table" style="margin-top:15px;">
        <thead><tr><th style="width:38%">Field</th><th>Details</th></tr></thead>
        <tbody>
          ${status ? `<tr><td><strong>Status</strong></td><td>${status}</td></tr>` : ""}
          ${reportId ? `<tr><td><strong>Report ID</strong></td><td>${reportId}</td></tr>` : ""}
          ${inspector ? `<tr><td><strong>Inspector</strong></td><td>${inspector}</td></tr>` : ""}
          ${supervisor ? `<tr><td><strong>Supervisor</strong></td><td>${supervisor}</td></tr>` : ""}
          ${form.inspectionDate ? `<tr><td><strong>Inspection Date</strong></td><td>${sanitizeText(form.inspectionDate)}</td></tr>` : ""}
          ${obsTime !== "—" ? `<tr><td><strong>Observation Time</strong></td><td>${obsTime}</td></tr>` : ""}
          ${addressText ? `<tr><td><strong>Address</strong></td><td>${addressText}</td></tr>` : ""}
          ${
            weather
              ? `<tr><td><strong>Weather Conditions</strong></td><td>${weather.temperature}°C${weather.condition ? ` | ${weather.condition}` : ""}<br/>Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} m/s</td></tr>`
              : ""
          }
          ${impact ? `<tr><td><strong>Impact Rating</strong></td><td>${impact}</td></tr>` : ""}
        </tbody>
      </table>
    </div>
  </div>`;

  const page2 = `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">2. Background</h2>
      ${autoSummaryHTML}
    </div>
  </div>`;

  /* Field Observation — heading left, paragraph centered */
  const observationRows: string[] = [];
  const addObservation = (label: string, v?: string | number) => {
    const s = sanitizeText(v);
    if (s) {
      observationRows.push(`
        <div class="nk-print-section-row">
          <div class="nk-print-section-cell-left">
            <h3 class="nk-field-heading">${label}</h3>
          </div>
          <div class="nk-print-section-cell-right">
            <div class="nk-print-content">
              <p class="nk-center-paragraph" style="margin:0;">${s}</p>
            </div>
          </div>
        </div>
      `);
    }
  };
  addObservation("Schedule Compliance", form.scheduleCompliance);
  addObservation("Material Availability", form.materialAvailability);
  addObservation("Safety Compliance", form.safetyCompliance);
  addObservation("Work Progress", form.workProgress);
  addObservation("Additional Comments", form.additionalComments);

  const page3 =
    observationRows.length > 0
      ? `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">3. Field Observation</h2>
      ${observationRows.join("")}
    </div>
  </div>`
      : "";

  /* Photos */
  const makePhotoCard = (photo: PhotoData, fig: number) => {
    const cap = sanitizeText(photo.caption || photo.name || `Photo ${fig}`);
    const desc = sanitizeText(photo.description);
    const isRemote = photo.data && photo.data.startsWith("http");
    return `
      <div class="nk-print-photo-item">
        <div class="nk-photo-display-row">
          <div class="nk-photo-image-cell">
            <div class="nk-imgwrap">
              <img src="${isRemote ? "" : photo.data}" alt="${cap}" data-image-src="${isRemote ? photo.data : ""}" loading="eager" />
            </div>
          </div>
          <div class="nk-photo-info-cell">
            <div class="nk-caption-wrapper">
              <div class="nk-caption-label">Caption:</div>
              <div class="nk-caption-text">Figure ${fig}. ${cap}</div>
            </div>
            ${desc ? `
            <div class="nk-description-wrapper">
              <div class="nk-description-label">Description:</div>
              <div class="nk-description-text">${desc}</div>
            </div>` : ""}
          </div>
        </div>
      </div>`;
  };

  const photoPage =
    photos.length > 0
      ? `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">4. Photo Evidence</h2>
      <div class="nk-print-photo-grid">
        ${photos.map((p, i) => makePhotoCard(p, i + 2)).join("")}
      </div>
    </div>
  </div>`
      : "";

  const additionalPage =
    additionalPhotos.length > 0
      ? `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">Additional Documentation</h2>
      <div class="nk-print-photo-grid">
        ${additionalPhotos.map((p, i) => makePhotoCard(p, (photos?.length || 0) + i + 2)).join("")}
      </div>
    </div>
  </div>`
      : "";

  const contentConclusion = buildContentConclusion(form, photos.length, additionalPhotos.length);
  const conclusionHTML = buildAutoConclusion(form);

  const pageLast = `
  <div class="nk-page">
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">5. Conclusion & Sign-off</h2>
      ${contentConclusion}
      <div style="height:10px;"></div>
      ${conclusionHTML}
      <div class="nk-print-content" style="margin-top:15px;">
        <table class="nk-print-table"><tbody>
          <tr>
            <td style="width:50%;vertical-align:top;">
              <strong style="font-size:11pt; color:#2D3748;">Inspector</strong><br/>
              <div style="margin-top:10px;">
                ${inspector ? `<div style="margin-bottom:6px;">Name: <strong>${inspector}</strong></div>` : ""}
                ${form.inspectorDesignation ? `Designation: ${sanitizeText(form.inspectorDesignation)}<br/>` : ""}
                ${form.inspectorId ? `ID: ${sanitizeText(form.inspectorId)}<br/>` : ""}
                ${form.signatureData ? `<div style="margin-top:10px;border:1px solid #E2E8F0;padding:8px;border-radius:6px;background:#F7FAFC;"><img src="${form.signatureData}" alt="Inspector Signature" style="max-width:200px;max-height:80px;object-fit:contain;"/></div>` : ""}
              </div>
            </td>
            <td style="width:50%;vertical-align:top;">
              <strong style="font-size:11pt; color:#2D3748;">Supervisor / Client Acknowledgment</strong><br/>
              <div style="margin-top:10px;">
                Name: ${supervisor || sanitizeText(form.clientName) || "—"}<br/>
                ${form.supervisorDesignation ? `Designation: ${sanitizeText(form.supervisorDesignation)}<br/>` : ""}
                ${form.clientId ? `ID: ${sanitizeText(form.clientId)}<br/>` : ""}
              </div>
            </td>
          </tr>
        </tbody></table>
      </div>
    </div>
    <div class="nk-print-footer">
      <div class="nk-print-footer-brand">NineKiwi Inspection Services</div>
      <div class="nk-print-footer-text">This report is confidential and intended for authorized personnel only.<br/>All findings and recommendations are based on site conditions at the time of inspection.</div>
      <div class="nk-print-footer-contact">For inquiries, please contact your project manager or visit ninekiwi.com</div>
    </div>
  </div>`;

  return page1 + page2 + page3 + photoPage + additionalPage + pageLast;
}

/* =========================
   RENDER TO PDF
   ========================= */
async function renderPaginatedRootToPDF(root: HTMLElement, filename: string, form: FormData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf: JsPDFType = new jsPDF("p", "mm", "a4");

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"));
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img[data-image-src]"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("data-image-src");
      if (src) img.src = await fetchToDataURL(src);
      img.removeAttribute("data-image-src");
    })
  );

  await waitForImages(root);

  // --- reserve bottom area so footer never overlaps page content snapshot
  const pageWidth = pdf.internal.pageSize.getWidth();   // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297
  const footerReserve = 20; // mm reserved at bottom for line + footer text

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i]);
    const scale = Math.min(
      pageWidth / canvas.width,
      (pageHeight - footerReserve) / canvas.height
    );
    const imgW = canvas.width * scale;
    const imgH = canvas.height * scale;
    const x = (pageWidth - imgW) / 2; // center horizontally
    const y = 0;                      // start at top, leave footerReserve free at bottom
    if (i > 0) pdf.addPage();
    const { data, type } = canvasToDataUrlSafe(canvas);
    pdf.addImage(data, type, x, y, imgW, imgH, undefined, "FAST");
  }

  // Footer: centered descriptor + right page numbers (no overlap now)
  const total = pdf.getNumberOfPages();
  const year = new Date().getFullYear();
  const location = sanitizeText(form.location) || "Site";
  const inspectionDate = form.inspectionDate
    ? new Date(form.inspectionDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "Date";
  const reportId = sanitizeText(form.reportId) || "N-000";
  const leftFooter = ""; // set to "" so nothing (like "Doe") prints on the left

  const centerFooter = `${year} Annual Inspection at the ${location}, ${inspectionDate} Doc. No. ${reportId}`;

  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setLineWidth(0.2);

    // draw the separator line *within* the reserved footer area
    const lineY = pageHeight - (footerReserve - 2); // e.g., 279 if reserve is 20
    pdf.line(10, lineY, pageWidth - 10, lineY);

    if (leftFooter) pdf.text(leftFooter, 10, pageHeight - 5);
    pdf.text(centerFooter, pageWidth / 2, pageHeight - 5, { align: "center" });
    pdf.text(`Page ${p} of ${total}`, pageWidth - 10, pageHeight - 5, { align: "right" });
  }

  pdf.save(filename);
}

function getLiveSectionTitles(): string[] {
  const preview = document.getElementById("reportPreview");
  if (!preview) return [];
  const titles: string[] = [];
  const sections = preview.querySelectorAll(".form-section h2");
  sections.forEach((h) => {
    const t = h.textContent?.trim();
    if (t) titles.push(t);
  });
  return titles;
}

/* =========================
   PUBLIC EXPORTS
   ========================= */
export async function generateFullReportPDF(
  form: FormData,
  _sectionPhotos: Record<string, PhotoData[]>,
  _signatureData: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const preview = document.getElementById("reportPreview");
  if (!preview) {
    alert("Report preview not found. Please ensure the report is visible.");
    return;
  }

  // Build TOC from live view AND include the conclusion section
  const tocLive = getLiveSectionTitles();
  const toc = [...tocLive, "Conclusion & Sign-off"];
  const front = await buildFrontPages(form, toc);

  const children = Array.from(preview.children) as HTMLElement[];
  const sectionsHTML = children
    .filter((el) => el?.innerText?.trim().length > 0)
    .map((el) => `<div class="nk-page">${el.outerHTML}</div>`)
    .join("");

  const fullReportConclusion = `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Conclusion & Sign-off</h2>
        ${buildContentConclusion(form, 0, 0)}
        ${buildAutoConclusion(form)}
      </div>
    </div>
  `;

  const html = front + sectionsHTML + fullReportConclusion;

  const cleanup = mountTemp(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `ninekiwi_report_${getFilenameBase(form)}_${dateStr}.pdf`;
    await renderPaginatedRootToPDF(root, filename, form);
  } catch (e) {
    console.error("PDF generation failed:", e);
    alert("PDF generation failed. Please try again or contact support.");
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

  const autoSummary = document.getElementById("autoSummary")?.innerHTML || "";
  const enriched = enrichSummaryHTML(autoSummary);
  const formPlus = signatureData ? { ...form, signatureData } : form;

  // TOC with explicit Conclusion
  const toc = [
    "Site Location and Field Condition Summary",
    "Background",
    "Field Observation",
    "Photo Evidence",
    "Conclusion & Sign-off",
  ];

  const front = await buildFrontPages(formPlus, toc);
  const body = await buildSummaryReportHTML(formPlus, enriched, summaryPhotos, additionalPhotos);
  const html = front + body;

  const cleanup = mountTemp(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `ninekiwi_summary_${getFilenameBase(form)}_${dateStr}.pdf`;
    await renderPaginatedRootToPDF(root, filename, formPlus);
  } catch (e) {
    console.error("Summary PDF generation failed:", e);
    alert("Summary PDF generation failed. Please try again or contact support.");
  } finally {
    cleanup();
  }
}

export async function generateSummaryWord(_form: FormData, _summaryPhotos: PhotoData[]): Promise<void> {
  alert("Word export functionality is coming soon. Please use PDF export for now.");
}
