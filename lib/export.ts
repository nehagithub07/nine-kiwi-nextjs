/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type AnyForm = Record<string, any>;
type AnyPhoto = {
  name: string;
  data: string;
  includeInSummary?: boolean;
  caption?: string;
  figureNumber?: number;
  description?: string;
};

type AddressObj = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
};

const SAFE_PRINT_CSS = `
@page { size: A4; margin: 0; }

.nk-print, .nk-print * {
  color: #1A202C !important;
  box-sizing: border-box !important;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6; font-size: 11pt;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.nk-page {
  width: 210mm; min-height: 297mm; padding: 18mm;
  margin: 0 auto 10mm auto; background: white; position: relative;
  page-break-after: always; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.nk-page:last-child { page-break-after: auto; }

.nk-print-header {
  background: linear-gradient(135deg, #78C850 0%, #5FA838 100%);
  color: #fff !important; padding: 24px; margin: -18mm -18mm 20px -18mm;
  position: relative; overflow: hidden; border-radius: 0;
}
.nk-print-header::before {
  content: ''; position: absolute; top: -50%; right: -10%;
  width: 300px; height: 300px; background: rgba(255,255,255,0.08); border-radius: 50%;
}
.nk-print-header * { color: #fff !important; position: relative; z-index: 1; }

.nk-print-logo-wrapper { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.nk-print-logo {
  width: 56px; height: 56px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
  border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 24px; border: 2px solid rgba(255,255,255,0.3);
}
.nk-print-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
.nk-print-subtitle { font-size: 13px; opacity: 0.95; margin-top: 6px; font-weight: 400; }
.nk-print-date { font-size: 11px; opacity: 0.9; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.25); }

.nk-print-meta {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; padding: 18px;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%); border-radius: 10px; border-left: 4px solid #78C850;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.nk-print-meta-item {
  display: flex; flex-direction: column; gap: 4px; padding: 10px;
  background: #fff; border-radius: 6px; border: 1px solid #E2E8F0;
}
.nk-print-meta-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase; color: #718096; letter-spacing: 0.6px;
}
.nk-print-meta-value { font-size: 12px; font-weight: 600; color: #2D3748; line-height: 1.3; word-break: break-word; }

.nk-print-section { margin: 20px 0; page-break-inside: avoid; }
.nk-print-section-title {
  font-size: 18px; font-weight: 700; color: #2D3748; margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 3px solid #78C850; position: relative; padding-left: 14px;
}
.nk-print-section-title::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, #78C850 0%, #5FA838 100%); border-radius: 2px;
}
.nk-print-content { font-size: 11px; line-height: 1.7; color: #4A5568; }

.nk-print-map {
  width: 100%; min-height: 250px; border-radius: 8px; border: 2px solid #E2E8F0; margin-top: 12px; overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;
}
.nk-print-map img { width: 100%; height: auto; object-fit: contain; display: block; }

.nk-print-table { width: 100%; border-collapse: collapse; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.nk-print-table th, .nk-print-table td { padding: 8px 10px; border: 1px solid #E2E8F0; text-align: left; vertical-align: top; font-size: 10px; }
.nk-print-table thead th { background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%); font-weight: 700; color: #2D3748; border-bottom: 2px solid #78C850; }

.nk-print-photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
.nk-print-photo-item {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; text-align: center; page-break-inside: avoid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s;
}
.nk-print-photo-item img { width: 100%; height: auto; max-height: 240px; object-fit: contain; border-radius: 6px; margin-bottom: 6px; }
.nk-print-photo-caption { font-size: 9px; color: #718096; font-weight: 500; word-break: break-word; line-height: 1.3; }
.nk-print-photo-description {
  margin-top: 8px; font-size: 10px; color: #4A5568; text-align: left; line-height: 1.4; padding: 8px; background: #F7FAFC; border-radius: 4px;
}

.nk-print-footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #E2E8F0; text-align: center;
  position: absolute; bottom: 18mm; left: 18mm; right: 18mm; }
.nk-print-footer-brand { font-weight: 700; font-size: 11px; color: #2D3748; margin-bottom: 4px; }
.nk-print-footer-text { font-size: 9px; color: #718096; line-height: 1.5; }
.nk-print-footer-contact { font-size: 9px; color: #4A5568; margin-top: 6px; }
.nk-page-number { position: absolute; bottom: 10mm; right: 18mm; font-size: 9px; color: #718096; }
`;

function sanitizeText(s: string): string {
  if (!s) return "";
  let t = s;
  t = t.replace(/\b(refse|weafwe|ERFARF|lorem ipsum(?:[^.]*)?)\b/gi, "").trim();
  t = t.replace(/\bimage\.jpg\b/gi, "Photo evidence");
  t = t.replace(/\bN\/A\b/g, "Not applicable");
  t = t.replace(/\bYes\b(?!\s*\()/g, "Yes (confirmed)");
  t = t.replace(/\bNo\b(?!\s*\()/g, "No (not observed)");
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return t;
}

function impactLabel(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw).toLowerCase().trim();
  if (/^(3|high|h)$/.test(s)) return "High";
  if (/^(2|medium|med|m)$/.test(s)) return "Medium";
  if (/^(1|low|l)$/.test(s)) return "Low";
  return sanitizeText(String(raw));
}

function enrichSummary(autoSummary: string): string {
  const cleaned = sanitizeText(autoSummary || "");
  if (!cleaned || /lorem/i.test(cleaned) || cleaned.length < 80) {
    return `<div class="nk-print-content">
      <p><strong>Executive Summary</strong></p>
      <ul style="margin-top: 12px; padding-left: 20px;">
        <li><strong>Risks Identified:</strong> Detailed in inspection sections</li>
        <li><strong>Immediate Corrective Actions:</strong> See recommendations</li>
        <li><strong>Next Steps & Owners:</strong> Assigned per section</li>
        <li><strong>Schedule Position:</strong> Current status documented</li>
      </ul>
    </div>`;
  }
  return `<div class="nk-print-content">${cleaned}</div>`;
}

function mountTemp(html: string): () => void {
  const el = document.createElement("div");
  el.className = "nk-print";
  const styleEl = document.createElement("style");
  styleEl.textContent = SAFE_PRINT_CSS;
  el.appendChild(styleEl);

  const content = document.createElement("div");
  content.innerHTML = html;

  el.appendChild(content);
  document.body.appendChild(el);
  return () => {
    if (el.parentNode) el.parentNode.removeChild(el);
  };
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) {
        return img.decode?.().catch(() => {}) ?? Promise.resolve();
      }
      return new Promise<void>((res) => {
        img.addEventListener("load", () => res(), { once: true });
        img.addEventListener("error", () => res(), { once: true });
      });
    })
  );
}

async function renderNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default as any;
  const canvas: HTMLCanvasElement = await html2canvas(node, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 15000,
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.max(node.scrollWidth, node.clientWidth),
    windowHeight: Math.max(node.scrollHeight, node.clientHeight),
  });
  return canvas;
}

function canvasToDataUrlSafe(
  canvas: HTMLCanvasElement
): { data: string; type: "PNG" | "JPEG" } {
  try {
    const png = canvas.toDataURL("image/png", 1.0);
    if (png.startsWith("data:image/png")) return { data: png, type: "PNG" };
  } catch {
    /* ignore */
  }
  const jpg = canvas.toDataURL("image/jpeg", 0.98);
  return { data: jpg, type: "JPEG" };
}

async function renderPaginatedRootToPDF(root: HTMLElement, filename: string): Promise<void> {
  const mod = await import("jspdf");
  const pdf = new mod.jsPDF("p", "mm", "a4");

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"));
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i]);
    const { data, type } = canvasToDataUrlSafe(canvas);
    const imgW = 210;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(data, type, 0, 0, imgW, imgH, undefined, "FAST");
  }

  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const footer = `NineKiwi Inspection Report | Confidential | Page ${p} of ${total}`;
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.text(footer, pageWidth / 2, 290, { align: "center" });
  }

  pdf.save(filename);
}

/** Static map for Summary PDF (PDF-safe). Prefers Google Static Maps when key is present. */
async function generateMapImage(form: AnyForm): Promise<string> {
  const latStr = String(form?.lat ?? "").trim();
  const lonStr = String(form?.lon ?? "").trim();
  const lat = Number(latStr);
  const lon = Number(lonStr);
  const hasCoords = latStr !== "" && lonStr !== "" && Number.isFinite(lat) && Number.isFinite(lon);

  const addressParts = [
    form?.streetAddress,
    [form?.city, form?.state].filter(Boolean).join(", "),
    [form?.country, form?.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const query: string | null = hasCoords
    ? `${lat},${lon}`
    : (form?.location && String(form.location).trim()) ||
      (addressParts.length ? addressParts.join(", ") : "") ||
      null;

  if (!query) return "";

  try {
    const gkey = process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY;

    let mapUrl = "";
    if (gkey) {
      mapUrl = hasCoords
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=1200x600&scale=2&markers=color:green|${lat},${lon}&key=${gkey}`
        : `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(query)}&zoom=15&size=1200x600&scale=2&markers=color:green|${encodeURIComponent(query)}&key=${gkey}`;
    } else {
      mapUrl = hasCoords
        ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=1200x600&markers=${lat},${lon},lightgreen-pushpin`
        : `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(query)}&zoom=15&size=1200x600&markers=${encodeURIComponent(query)},lightgreen-pushpin`;
    }
    return `<img src="${mapUrl}" alt="Site Location Map" style="width:100%;height:auto;object-fit:contain;display:block;" crossorigin="anonymous" referrerpolicy="no-referrer" />`;
  } catch (error) {
    console.error("Map generation error:", error);
    return "";
  }
}

function fmtAddressFromSplit(form: AnyForm): string {
  const parts = [
    form.streetAddress,
    [form.city, form.state].filter(Boolean).join(", "),
    [form.country, form.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((s: string) => s.trim())
    .filter(Boolean);
  return sanitizeText(parts.join(" • "));
}

function fmtAddressFromObject(address?: AddressObj): string {
  if (!address) return "";
  const parts = [
    address.street,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.country, address.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean);
  return sanitizeText(parts.join(" • "));
}

function getReportTitle(form: AnyForm): string {
  const base =
    (form.status && String(form.status).trim()) ||
    (form.reportId && String(form.reportId).trim()) ||
    (form.location && String(form.location).trim()) ||
    "inspection";
  return sanitizeText(base);
}

function getFilenameBase(form: AnyForm): string {
  const base = getReportTitle(form);
  return base.replace(/[^\w.-]+/g, "_");
}

async function generateEnhancedSummaryHTML(
  form: AnyForm,
  autoSummary: string,
  photos: AnyPhoto[] = [],
  additionalPhotos: AnyPhoto[] = []
): Promise<string> {
  const currentDate = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const logoHTML = form.companyLogo
    ? `<img src="${form.companyLogo}" alt="Logo" style="width:56px;height:56px;border-radius:14px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.2);object-fit:cover" />`
    : `<div class="nk-print-logo">NK</div>`;

  const impact = impactLabel(form.impactRating);
  const location = sanitizeText(form.location || "");
  const status = sanitizeText(form.status || "");
  const reportId = sanitizeText(form.reportId || "");
  const inspector = sanitizeText(form.inspectorName || form.inspector || "");

  const summaryHTML = enrichSummary(autoSummary);
  const mapHTML = await generateMapImage(form);

  const addressText =
    fmtAddressFromSplit(form) ||
    fmtAddressFromObject((form.address as AddressObj) || undefined);

  const weatherData =
    form.temperature || form.humidity || form.windSpeed || form.weatherDescription
      ? {
          temperature: Number(form.temperature || 0),
          condition: String(form.weatherDescription || ""),
          humidity: Number(form.humidity || 0),
          windSpeed: Number(form.windSpeed || 0),
        }
      : null;

  const coverAndDetailsPage = `
    <div class="nk-page">
      <div class="nk-print-header">
        <div class="nk-print-logo-wrapper">
          ${logoHTML}
          <div>
            <h1 class="nk-print-title">NineKiwi Inspection Report</h1>
            <div class="nk-print-subtitle">Professional Site Inspection & Assessment</div>
          </div>
        </div>
        <div class="nk-print-date">Generated on ${currentDate}</div>
      </div>

      <div class="nk-print-meta">
        ${status ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Status</div>
          <div class="nk-print-meta-value">${status}</div>
        </div>` : ''}

        ${reportId ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Report ID</div>
          <div class="nk-print-meta-value">${reportId}</div>
        </div>` : ''}

        ${addressText ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Location Details</div>
          <div class="nk-print-meta-value">${addressText}</div>
        </div>` : ''}

        ${weatherData ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Weather</div>
          <div class="nk-print-meta-value">
            ${weatherData.temperature}°C ${weatherData.condition ? `| ${weatherData.condition}` : ""}<br>
            Humidity: ${weatherData.humidity}% | Wind: ${weatherData.windSpeed} m/s
          </div>
        </div>` : ''}

        ${inspector ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Inspector</div>
          <div class="nk-print-meta-value">${inspector}</div>
        </div>` : ''}

        ${impact ? `
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Impact Rating</div>
          <div class="nk-print-meta-value">${impact}</div>
        </div>` : ''}
      </div>

      ${mapHTML ? `<div class="nk-print-section">
        <h2 class="nk-print-section-title">Site Location</h2>
        <div class="nk-print-map">${mapHTML}</div>
      </div>` : ""}

      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Executive Summary</h2>
        ${summaryHTML}
      </div>
    </div>`;

  const detailRows: string[] = [];
  const addRow = (label: string, value?: string | number) => {
    const v = (value ?? "").toString().trim();
    if (v) detailRows.push(`<tr><td><strong>${label}</strong></td><td>${sanitizeText(v)}</td></tr>`);
  };

  addRow("Schedule", form.scheduleCompliance);
  addRow("Materials", form.materialAvailability);
  addRow("Safety", form.safetyCompliance);
  addRow("Work Progress", form.workProgress);
  addRow("General Notes", form.additionalComments);

  const detailsPage = detailRows.length
    ? `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Inspection Details</h2>
        <table class="nk-print-table">
          <thead><tr><th style="width:40%">Field</th><th>Details</th></tr></thead>
          <tbody>${detailRows.join("\n")}</tbody>
        </table>
      </div>
    </div>`
    : "";

  const photoPages =
    photos && photos.length
      ? `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Photo Evidence</h2>
        <div class="nk-print-photo-grid">
          ${photos
            .map((p, i) => {
              const figureNum = p.figureNumber || i + 1;
              const caption = sanitizeText(p.caption || p.name || `Photo ${figureNum}`);
              const description = p.description ? sanitizeText(p.description) : "";
              return `
              <div class="nk-print-photo-item">
                <img src="${p.data}" alt="${caption}" />
                <div class="nk-print-photo-caption">Figure ${figureNum}: ${caption}</div>
                ${description ? `<div class="nk-print-photo-description"><strong>Description:</strong> ${description}</div>` : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>
    </div>`
      : "";

  const additionalPhotosSection =
    additionalPhotos && additionalPhotos.length
      ? `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Additional Documentation</h2>
        <div class="nk-print-photo-grid">
          ${additionalPhotos
            .map((p, i) => {
              const figureNum = (photos?.length || 0) + i + 1;
              const caption = sanitizeText(p.caption || p.name || `Photo ${figureNum}`);
              const description = p.description ? sanitizeText(p.description) : "";
              return `
              <div class="nk-print-photo-item">
                <img src="${p.data}" alt="${caption}" />
                <div class="nk-print-photo-caption">Figure ${figureNum}: ${caption}</div>
                ${description ? `<div class="nk-print-photo-description"><strong>Description:</strong> ${description}</div>` : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>
    </div>`
      : "";

  const signOffPage = `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Digital Sign-off & Acknowledgment</h2>
        <div class="nk-print-content">
          <table class="nk-print-table">
            <tbody>
              <tr>
                <td style="width:50%;vertical-align:top;">
                  <strong>Inspector</strong><br/>
                  <div style="margin-top: 8px;">
                    ${inspector ? `<div style="margin-bottom:8px;">Name: <strong>${inspector}</strong></div>` : ""}
                    ${form.inspectorDesignation ? `Designation: ${sanitizeText(form.inspectorDesignation)}<br/>` : ""}
                    ${form.inspectorId ? `ID: ${sanitizeText(form.inspectorId)}<br/>` : ""}
                    ${form.signatureData ? `<div style="margin-top:12px;border:1px solid #E2E8F0;padding:8px;border-radius:6px;background:#F7FAFC;"><img src="${form.signatureData}" alt="Inspector Signature" style="max-width:200px;max-height:80px;object-fit:contain;"/></div>` : ""}
                  </div>
                </td>
                <td style="width:50%;vertical-align:top;">
                  <strong>Supervisor / Client Acknowledgment</strong><br/>
                  <div style="margin-top: 8px;">
                    Name: ${sanitizeText(form.supervisorName || "—")}<br/>
                    ${form.supervisorDesignation ? `Designation: ${sanitizeText(form.supervisorDesignation)}<br/>` : ""}
                    ${form.clientId ? `ID: ${sanitizeText(form.clientId)}<br/>` : ""}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="nk-print-footer">
        <div class="nk-print-footer-brand">NineKiwi Inspection Services</div>
        <div class="nk-print-footer-text">
          This report is confidential and intended for authorized personnel only.<br/>
          All findings and recommendations are based on site conditions at the time of inspection.
        </div>
        <div class="nk-print-footer-contact">
          For inquiries, please contact your project manager or visit ninekiwi.com
        </div>
      </div>
    </div>`;

  return coverAndDetailsPage + detailsPage + photoPages + additionalPhotosSection + signOffPage;
}

/* ---------------- Public APIs ---------------- */

export async function generateFullReportPDF(
  form: AnyForm,
  _photos: AnyPhoto[],
  _signatureData: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const reportPreview = document.getElementById("reportPreview");
  if (!reportPreview) {
    alert("Report preview not found.");
    return;
  }

  const children = Array.from(reportPreview.children) as HTMLElement[];
  const sectionsHTML = children
    .filter((el) => el && el.innerText.trim().length > 0)
    .map((section) => `<div class="nk-page">${section.outerHTML}</div>`)
    .join("");

  const cleanup = mountTemp(sectionsHTML);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    await waitForImages(root);

    const filename = `ninekiwi_report_${getFilenameBase(form)}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    await renderPaginatedRootToPDF(root, filename);
  } catch (e) {
    console.error(e);
    alert("PDF generation failed. Please try again.");
  } finally {
    cleanup();
  }
}

export async function generateSummaryPDF(
  form: AnyForm,
  summaryPhotos: AnyPhoto[],
  additionalPhotos: AnyPhoto[] = [],
  signatureData?: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const autoSummary = document.getElementById("autoSummary")?.innerHTML || "";
  const formWithSignature = signatureData ? { ...form, signatureData } : form;
  const html = await generateEnhancedSummaryHTML(
    formWithSignature,
    autoSummary,
    summaryPhotos,
    additionalPhotos
  );

  const cleanup = mountTemp(html);
  try {
    const root = document.body.lastElementChild as HTMLElement;
    await waitForImages(root);

    const filename = `ninekiwi_summary_${getFilenameBase(form)}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    await renderPaginatedRootToPDF(root, filename);
  } catch (e) {
    console.error(e);
    alert("Summary PDF generation failed. Please try again.");
  } finally {
    cleanup();
  }
}

export async function generateSummaryWord(
  _form: AnyForm,
  _summaryPhotos: AnyPhoto[]
): Promise<void> {
  alert("Word export is not yet implemented.");
}
