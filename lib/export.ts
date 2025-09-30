// lib/export.ts
"use client"

type AnyForm = Record<string, any>
type AnyPhoto = { name: string; data: string; includeInSummary?: boolean }

/** Print-safe skin + components (used inside our virtual pages) */
const SAFE_PRINT_CSS = `
.nk-print, .nk-print * {
  color: #1A202C !important;
  background: #FFFFFF !important;
  border-color: #E5E7EB !important;
  outline-color: #E5E7EB !important;
  box-shadow: none !important;
  text-shadow: none !important;
  --tw-ring-color: transparent !important;
  --tw-ring-shadow: 0 0 #0000 !important;
  --tw-shadow: 0 0 #0000 !important;
  --tw-shadow-colored: 0 0 #0000 !important;
  background-image: none !important;
  filter: none !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  box-sizing: border-box !important;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  font-size: 11pt;
}

/* Virtual A4 pages (we paginate into these before rendering) */
.nk-page {
  width: 210mm;
  max-width: 210mm;
  min-height: 295mm;
  padding: 16mm;
  margin: 0 auto;
  position: relative;
  overflow: visible;
}

/* ---------------- Header ---------------- */
.nk-print-header {
  background: linear-gradient(135deg, #78C850 0%, #5FA838 100%);
  color: #fff !important;
  padding: 32px 28px;
  margin: -16mm -16mm 24px -16mm; /* bleed inside page */
  position: relative;
  overflow: hidden;
}
.nk-print-header::before {
  content: '';
  position: absolute; top: -50%; right: -10%;
  width: 300px; height: 300px;
  background: rgba(255,255,255,0.08); border-radius: 50%;
}
.nk-print-header * { color: #fff !important; position: relative; z-index: 1; }
.nk-print-logo-wrapper { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.nk-print-logo {
  width: 56px; height: 56px; background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px); border-radius: 14px;
  display:inline-flex; align-items:center; justify-content:center;
  font-weight:700; font-size:24px; border:2px solid rgba(255,255,255,0.3);
}
.nk-print-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
.nk-print-subtitle { font-size: 13px; opacity: .95; margin-top: 6px; font-weight: 400; }
.nk-print-date { font-size: 11px; opacity: .9; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.25); }

/* ---------------- Meta grid ---------------- */
.nk-print-meta {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 20px; margin: 24px 0; padding: 24px;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  border-radius: 12px; border-left: 4px solid #78C850; break-inside: avoid;
}
.nk-print-meta-item { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; break-inside: avoid; }
.nk-print-meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #718096; letter-spacing: .8px; }
.nk-print-meta-value { font-size: 14px; font-weight: 600; color: #2D3748; line-height: 1.4; word-break: break-word; overflow-wrap: anywhere; }

/* ---------------- Sections ---------------- */
.nk-print-section { margin: 28px 0; break-inside: avoid; page-break-inside: avoid; }
.nk-print-section-title {
  font-size: 22px; font-weight: 700; color: #2D3748; margin-bottom: 16px;
  padding-bottom: 10px; border-bottom: 3px solid #78C850; position: relative; padding-left: 16px;
}
.nk-print-section-title::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, #78C850 0%, #5FA838 100%); border-radius: 2px;
}
.nk-print-content { font-size: 12px; line-height: 1.8; color: #4A5568; }
.nk-print-content p { margin-bottom: 12px; }
.nk-print-content ul { margin: 12px 0; padding-left: 24px; }
.nk-print-content li { margin-bottom: 8px; }
.nk-print-content li::marker { color: #78C850; font-weight: 600; }

/* ---------------- Zebra table ---------------- */
.nk-print-table { width: 100%; border-collapse: collapse; }
.nk-print-table th, .nk-print-table td { padding: 10px 12px; border: 1px solid #E2E8F0; text-align: left; vertical-align: top; }
.nk-print-table thead th { background: #F7FAFC; font-weight: 700; color: #2D3748; }
.nk-print-table tbody tr:nth-child(even) { background: #FAFAFA; }

/* ---------------- Photos ---------------- */
.nk-print-photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
.nk-print-photo-item { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; text-align: center; break-inside: avoid; }
.nk-print-photo-item img { width: 100%; height: auto; border-radius: 6px; margin-bottom: 8px; }
.nk-print-photo-caption { font-size: 10px; color: #718096; font-weight: 500; word-break: break-word; overflow-wrap: anywhere; }

/* ---------------- Content footer ---------------- */
.nk-print-footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #E2E8F0; text-align: center; }
.nk-print-footer-brand { font-weight: 700; font-size: 12px; color: #2D3748; margin-bottom: 6px; }
.nk-print-footer-text { font-size: 10px; color: #718096; line-height: 1.6; }
.nk-print-footer-contact { font-size: 10px; color: #4A5568; margin-top: 8px; }
`

/* ------------------------- Content cleanup helpers ------------------------- */
function sanitizeText(s: string) {
  if (!s) return ""
  let t = s
  t = t.replace(/\b(refse|weafwe|ERFARF|lorem ipsum(?:[^.]*)?)\b/gi, "").trim()
  t = t.replace(/\bimage\.jpg\b/gi, "Photo evidence")
  t = t.replace(/\bN\/A\b/g, "Not applicable today")
  t = t.replace(/\bYes\b(?!\s*\()/g, "Yes (details provided)")
  t = t.replace(/\bNo\b(?!\s*\()/g, "No (not observed today)")
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
  return t
}
function impactLabel(raw: any) {
  if (raw == null) return ""
  const s = String(raw).toLowerCase().trim()
  if (/^(3|high|h)$/.test(s)) return "High"
  if (/^(2|medium|med|m)$/.test(s)) return "Medium"
  if (/^(1|low|l)$/.test(s)) return "Low"
  return sanitizeText(String(raw))
}
function enrichSummary(autoSummary: string) {
  const cleaned = sanitizeText(autoSummary || "")
  if (!cleaned || /lorem/i.test(cleaned) || cleaned.length < 80) {
    return `
      <div class="nk-print-content">
        <p>Below is a concise summary tailored for quick decisions.</p>
        <ul>
          <li><strong>Risks Identified:</strong> —</li>
          <li><strong>Immediate Corrective Actions:</strong> —</li>
          <li><strong>Next Steps & Owners:</strong> —</li>
          <li><strong>Schedule Position:</strong> —</li>
        </ul>
      </div>
    `
  }
  return `<div class="nk-print-content">${cleaned}</div>`
}

/* ------------------------- Mounting helpers ------------------------- */
function mountTemp(html: string) {
  const el = document.createElement("div")
  el.className = "nk-print"
  const styleEl = document.createElement("style")
  styleEl.textContent = SAFE_PRINT_CSS + `
    *{animation:none !important; transition:none !important; transform:none !important;}
    [style*="position: sticky"], .sticky, [data-sticky]{ position:static !important; top:auto !important; }
  `
  el.appendChild(styleEl)
  const content = document.createElement("div")
  content.innerHTML = html
  el.appendChild(content)
  document.body.appendChild(el)
  return () => document.body.removeChild(el)
}

function getAutoSummaryHTML() {
  return document.getElementById("autoSummary")?.innerHTML ?? ""
}
function getReportPreviewHTML() {
  const node = document.getElementById("reportPreview") || document.querySelector("[data-report-root]")
  return node ? (node as HTMLElement).outerHTML : ""
}

/* ------------------------- HTML builder ------------------------- */
function generateEnhancedSummaryHTML(form: AnyForm, autoSummary: string, photos: AnyPhoto[] = []) {
  const inspectionDate = form.inspectionDate
    ? new Date(form.inspectionDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const currentDate = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
  const logoHTML = form.companyLogo
    ? `<img src="${form.companyLogo}" alt="Logo" style="width:56px;height:56px;border-radius:14px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.2);object-fit:cover" />`
    : `<div class="nk-print-logo">NK</div>`

  const impact = impactLabel(form.impactRating)
  const location = sanitizeText(form.location || "")
  const project = sanitizeText(form.projectName || "Untitled Project")
  const inspector = sanitizeText(form.inspector || "")
  const workers = sanitizeText(form.numWorkers ?? "0")

  const photoGridHTML = photos.length > 0 ? `
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">Photo Evidence</h2>
      <div class="nk-print-photo-grid">
        ${photos.map((p,i) => `
          <div class="nk-print-photo-item">
            <img src="${p.data}" alt="${sanitizeText(p.name || `Photo ${i+1}`)}">
            <div class="nk-print-photo-caption">${sanitizeText(p.name || `Photo ${i+1}`)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  ` : ""

  const summaryHTML = enrichSummary(autoSummary)

  const quickFacts = `
    <table class="nk-print-table" style="margin-top:8px">
      <thead><tr>
        <th style="width:32%">Field</th><th>Details</th>
      </tr></thead>
      <tbody>
        <tr><td>Schedule Status</td><td>${sanitizeText(form.scheduleStatus || "On plan")}</td></tr>
        <tr><td>Impact Rating</td><td>${impact || "—"}</td></tr>
        <tr><td>Materials Availability</td><td>${sanitizeText(form.materialsStatus || "Yes (all materials available as per schedule)")}</td></tr>
        <tr><td>Weather</td><td>${sanitizeText(form.weather || "Not applicable today")}</td></tr>
        <tr><td>Notes</td><td>${sanitizeText(form.generalNotes || "—")}</td></tr>
      </tbody>
    </table>
  `

  const signOff = `
    <div class="nk-print-section">
      <h2 class="nk-print-section-title">Digital Sign-off</h2>
      <div class="nk-print-content">
        <table class="nk-print-table">
          <tbody>
            <tr>
              <td style="width:50%">
                <strong>Inspector</strong><br/>
                ${inspector || "—"}<br/>
                ${sanitizeText(form.inspectorDesignation || "")}<br/>
                ${sanitizeText(form.inspectorId || "")}
              </td>
              <td style="width:50%">
                <strong>Supervisor / Client Acknowledgment</strong><br/>
                ${sanitizeText(form.supervisorName || "")}<br/>
                ${sanitizeText(form.supervisorDesignation || "")}<br/>
                ${sanitizeText(form.clientId || "")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `

  return `
    <div class="nk-page">
      <div class="nk-print-header">
        <div class="nk-print-logo-wrapper">
          ${logoHTML}
          <div>
            <h1 class="nk-print-title">${sanitizeText(form.reportTitle || "NineKiwi Inspection Report")}</h1>
            <div class="nk-print-subtitle">Professional Site Inspection & Quality Assessment</div>
          </div>
        </div>
        <div class="nk-print-date">Generated on ${currentDate}</div>
      </div>

      <div class="nk-print-meta">
        <div class="nk-print-meta-item"><div class="nk-print-meta-label">Project Name</div><div class="nk-print-meta-value">${project}</div></div>
        <div class="nk-print-meta-item"><div class="nk-print-meta-label">Inspection Date</div><div class="nk-print-meta-value">${inspectionDate}</div></div>
        <div class="nk-print-meta-item"><div class="nk-print-meta-label">Location</div><div class="nk-print-meta-value">${location || "Not applicable today"}</div></div>
        <div class="nk-print-meta-item"><div class="nk-print-meta-label">Workers On Site</div><div class="nk-print-meta-value">${workers}</div></div>
        ${inspector ? `<div class="nk-print-meta-item"><div class="nk-print-meta-label">Inspector</div><div class="nk-print-meta-value">${inspector}</div></div>` : ""}
        ${impact ? `<div class="nk-print-meta-item"><div class="nk-print-meta-label">Impact Rating</div><div class="nk-print-meta-value">${impact}</div></div>` : ""}
      </div>

      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Executive Summary</h2>
        ${summaryHTML}
      </div>

      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Inspection & Quality Survey</h2>
        ${quickFacts}
      </div>

      ${photoGridHTML}

      ${signOff}

      <div class="nk-print-footer">
        <div class="nk-print-footer-brand">NineKiwi Inspection Services</div>
        <div class="nk-print-footer-text">
          This report is confidential and intended for authorized personnel only.<br/>
          All findings and recommendations are based on site conditions at the time of inspection.
        </div>
        <div class="nk-print-footer-contact">For inquiries, please contact your project manager or visit ninekiwi.com</div>
      </div>
    </div>
  `
}

/* ------------------------- Pagination + rendering ------------------------- */

/** mm → px (96 dpi) */
function mmToPx(mm: number) { return Math.round((mm * 96) / 25.4) }

/**
 * Pack direct children of all `.nk-page` into multiple pages, respecting a
 * safe content height (A4 295mm − 2×16mm padding = ~263mm).
 * Never splits a block; if a single block is taller than a page, it’s placed alone.
 */
function paginateMountedRoot(root: HTMLElement) {
  const PADDING_MM = 16
  const PAGE_H_MM = 295
  const contentMaxPx = mmToPx(PAGE_H_MM - 2 * PADDING_MM) // ~263mm

  const originalBlocks: HTMLElement[] = []
  root.querySelectorAll<HTMLElement>(".nk-page").forEach((page) => {
    Array.from(page.children).forEach((child) => {
      if (child instanceof HTMLElement) originalBlocks.push(child)
    })
  })

  root.innerHTML = ""

  let currentPage = document.createElement("div")
  currentPage.className = "nk-page"
  root.appendChild(currentPage)

  let used = 0

  originalBlocks.forEach((block) => {
    currentPage.appendChild(block)
    const h = block.getBoundingClientRect().height

    if (used > 0 && used + h > contentMaxPx) {
      currentPage.removeChild(block)
      currentPage = document.createElement("div")
      currentPage.className = "nk-page"
      root.appendChild(currentPage)
      currentPage.appendChild(block)
      used = block.getBoundingClientRect().height
    } else {
      used += h
    }
  })
}

/* html2canvas render */
async function renderNodeToCanvas(node: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default
  const canvas = await html2canvas(node, {
    scale: 2.5, // high quality with sane memory
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 0,
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.max(node.scrollWidth, node.clientWidth),
    windowHeight: Math.max(node.scrollHeight, node.clientHeight),
  })
  return canvas
}

/* Safely get a data URL that jsPDF can ingest (PNG → JPEG fallback) */
function canvasToDataUrlSafe(canvas: HTMLCanvasElement): { data: string; type: "PNG" | "JPEG" } {
  try {
    const png = canvas.toDataURL("image/png")
    if (png.startsWith("data:image/png")) return { data: png, type: "PNG" }
  } catch { /* ignore */ }
  const jpg = canvas.toDataURL("image/jpeg", 0.95)
  return { data: jpg, type: "JPEG" }
}

/* Render each .nk-page to a PDF page and add page numbers */
async function renderPaginatedRootToPDF(root: HTMLElement, filename: string) {
  const { jsPDF } = await import("jspdf").then(m => ({ jsPDF: m.jsPDF }))
  const pdf = new jsPDF("p", "mm", "a4")

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"))
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i])
    const { data, type } = canvasToDataUrlSafe(canvas)
    const imgW = 210
    const imgH = (canvas.height * imgW) / canvas.width

    if (i === 0) {
      pdf.addImage(data, type, 0, 0, imgW, imgH, undefined, "FAST")
    } else {
      pdf.addPage()
      pdf.addImage(data, type, 0, 0, imgW, imgH, undefined, "FAST")
    }
  }

  // Page numbers
  const total = pdf.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)
    const footer = `NineKiwi Inspection Report | Confidential | Page ${p} of ${total}`
    const pageWidth = pdf.internal.pageSize.getWidth()
    pdf.text(footer, pageWidth / 2, 290, { align: "center" })
  }

  pdf.save(filename)
}

/* ------------------------- Public API ------------------------- */

export async function generateFullReportPDF(form: AnyForm, photos: AnyPhoto[], signatureData: string | null) {
  if (typeof window === "undefined") return
  if (!form?.projectName) { alert("Please enter Project Name."); return }

  const html = getReportPreviewHTML()
  if (!html) { alert("Nothing to export — preview not found."); return }

  const cleanup = mountTemp(html)
  try {
    const root = document.body.lastElementChild as HTMLElement
    paginateMountedRoot(root)
    const filename = `ninekiwi_report_${String(form.projectName).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    await renderPaginatedRootToPDF(root, filename)
  } catch (e) {
    console.error(e)
    alert("PDF generation failed.")
  } finally {
    cleanup()
  }
}

export async function generateSummaryPDF(form: AnyForm, summaryPhotos: AnyPhoto[]) {
  if (typeof window === "undefined") return
  if (!form?.projectName) { alert("Please enter Project Name."); return }

  const auto = getAutoSummaryHTML()
  const html = generateEnhancedSummaryHTML(form, auto, summaryPhotos)

  const cleanup = mountTemp(html)
  try {
    const root = document.body.lastElementChild as HTMLElement
    paginateMountedRoot(root)
    const filename = `ninekiwi_summary_${String(form.projectName).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    await renderPaginatedRootToPDF(root, filename)
  } catch (e) {
    console.error(e)
    alert("Summary PDF failed.")
  } finally {
    cleanup()
  }
}

export async function generateSummaryWord(form: AnyForm, summaryPhotos: AnyPhoto[]) {
  if (typeof window === "undefined") return
  if (!form?.projectName) { alert("Please enter Project Name."); return }

  const rows: string[] = []
  summaryPhotos.forEach((p: AnyPhoto, idx: number) => {
    const cell = `<td style="width:50%;vertical-align:top;border:1px solid #E2E8F0;padding:16px;background:#FAFAFA">
      <img src="${p.data}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
      <div style="font-size:10pt;color:#4A5568;margin-top:12px;font-weight:600;word-break:break-word;overflow-wrap:anywhere">${sanitizeText(p.name || "")}</div>
    </td>`
    if (idx % 2 === 0) rows.push("<tr>" + cell)
    else rows[rows.length - 1] += cell + "</tr>"
  })
  const fixedRows = rows.map(r => r.endsWith("</tr>") ? r : r + '<td style="width:50%;border:1px solid #E2E8F0"></td></tr>')

  const auto = getAutoSummaryHTML()
  const inspectionDate = form.inspectionDate
    ? new Date(form.inspectionDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const docHTML = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>NineKiwi Inspection Summary</title>
      <style>
        body{font-family:'Inter','Calibri',Arial,sans-serif;font-size:11pt;line-height:1.7;color:#2D3748;margin:0;padding:0}
        .header{background:linear-gradient(135deg,#78C850 0%,#5FA838 100%);color:white;padding:32px 28px;margin:-20px -20px 28px -20px}
        .header h1{font-size:26pt;margin:0 0 6pt 0;color:white;font-weight:700;letter-spacing:-0.5pt}
        .header .subtitle{font-size:11pt;opacity:0.95;font-weight:400;margin-bottom:12pt}
        .header .date{font-size:9pt;opacity:0.9;padding-top:12pt;border-top:1px solid rgba(255,255,255,0.25)}
        .meta-grid{display:table;width:100%;margin:20pt 0;background:#F7FAFC;padding:20pt;border-left:4px solid #78C850;border-radius:8pt}
        .meta-item{display:table-row}
        .meta-label{display:table-cell;font-weight:700;font-size:9pt;text-transform:uppercase;color:#718096;padding:8pt 16pt 8pt 0;letter-spacing:.8pt}
        .meta-value{display:table-cell;font-weight:600;color:#2D3748;padding:8pt 0;font-size:11pt;word-break:break-word;overflow-wrap:anywhere}
        h2{font-size:18pt;margin:24pt 0 12pt 0;color:#2D3748;border-bottom:3px solid #78C850;padding-bottom:8pt;font-weight:700;padding-left:12pt;border-left:4px solid #78C850}
        .section{margin:16pt 0;page-break-inside:avoid}
        .content{font-size:11pt;line-height:1.8;color:#4A5568}
        ul{margin:8pt 0 12pt 24pt;line-height:1.9}
        li{margin-bottom:6pt}
        img{max-width:100%;height:auto;border-radius:8px}
        .divider{height:2pt;background:linear-gradient(to right,#78C850,transparent);margin:20pt 0;border:none}
        .footer{margin-top:40pt;padding-top:20pt;border-top:2px solid #E2E8F0;text-align:center}
        .footer-brand{font-size:11pt;font-weight:700;color:#2D3748;margin-bottom:6pt}
        .footer-text{font-size:9pt;color:#718096;line-height:1.6}
        .footer-contact{font-size:9pt;color:#4A5568;margin-top:8pt}
        table{page-break-inside:avoid;border-collapse:collapse;width:100%}
        td{vertical-align:top}
      </style>
    </head>
    <body style="margin:20px">
      <div class="header">
        <h1>${sanitizeText(form.reportTitle || "NineKiwi Inspection Report")}</h1>
        <div class="subtitle">Professional Site Inspection & Quality Assessment</div>
        <div class="date">Generated on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Project Name:</div><div class="meta-value">${sanitizeText(form.projectName || "Untitled Project")}</div></div>
        <div class="meta-item"><div class="meta-label">Inspection Date:</div><div class="meta-value">${inspectionDate}</div></div>
        <div class="meta-item"><div class="meta-label">Location:</div><div class="meta-value">${sanitizeText(form.location || "Not applicable today")}</div></div>
        <div class="meta-item"><div class="meta-label">Workers On Site:</div><div class="meta-value">${sanitizeText(form.numWorkers ?? "0")}</div></div>
        ${form.inspector ? `<div class="meta-item"><div class="meta-label">Inspector:</div><div class="meta-value">${sanitizeText(form.inspector)}</div></div>` : ""}
        ${form.impactRating ? `<div class="meta-item"><div class="meta-label">Impact Rating:</div><div class="meta-value">${impactLabel(form.impactRating)}</div></div>` : ""}
      </div>

      <hr class="divider">

      <h2>Executive Summary</h2>
      <div class="section content">${enrichSummary(auto)}</div>

      ${summaryPhotos.length ? `
      <h2>Summary Photos</h2>
      <table border="0" cellspacing="0" cellpadding="0">
        ${fixedRows.join("")}
      </table>` : ""}

      <div class="footer">
        <div class="footer-brand">NineKiwi Inspection Services</div>
        <div class="footer-text">
          This report is confidential and intended for authorized personnel only.<br/>
          All findings and recommendations are based on site conditions at the time of inspection.
        </div>
        <div class="footer-contact">For inquiries, please contact your project manager or visit ninekiwi.com</div>
      </div>
    </body></html>
  `
  const blob = new Blob([docHTML], { type: "application/msword" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ninekiwi_summary_${String(form.projectName).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.doc`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
