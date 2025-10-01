type AnyForm = Record<string, any>
type AnyPhoto = { name: string; data: string; includeInSummary?: boolean }

const SAFE_PRINT_CSS = `
@page {
  size: A4;
  margin: 0;
}

.nk-print, .nk-print * {
  color: #1A202C !important;
  box-sizing: border-box !important;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  font-size: 11pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.nk-page {
  width: 210mm;
  min-height: 297mm;
  padding: 18mm;
  margin: 0 auto 10mm auto;
  background: white;
  position: relative;
  page-break-after: always;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nk-page:last-child {
  page-break-after: auto;
}

.nk-print-header {
  background: linear-gradient(135deg, #78C850 0%, #5FA838 100%);
  color: #fff !important;
  padding: 24px;
  margin: -18mm -18mm 20px -18mm;
  position: relative;
  overflow: hidden;
  border-radius: 0;
}

.nk-print-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}

.nk-print-header * {
  color: #fff !important;
  position: relative;
  z-index: 1;
}

.nk-print-logo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.nk-print-logo {
  width: 56px;
  height: 56px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
  border: 2px solid rgba(255,255,255,0.3);
}

.nk-print-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.nk-print-subtitle {
  font-size: 13px;
  opacity: 0.95;
  margin-top: 6px;
  font-weight: 400;
}

.nk-print-date {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.25);
}

.nk-print-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 18px 0;
  padding: 18px;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  border-radius: 10px;
  border-left: 4px solid #78C850;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nk-print-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
}

.nk-print-meta-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #718096;
  letter-spacing: 0.6px;
}

.nk-print-meta-value {
  font-size: 12px;
  font-weight: 600;
  color: #2D3748;
  line-height: 1.3;
  word-break: break-word;
}

.nk-print-section {
  margin: 20px 0;
  page-break-inside: avoid;
}

.nk-print-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 3px solid #78C850;
  position: relative;
  padding-left: 14px;
}

.nk-print-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #78C850 0%, #5FA838 100%);
  border-radius: 2px;
}

.nk-print-content {
  font-size: 11px;
  line-height: 1.7;
  color: #4A5568;
}

.nk-print-map {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  border: 2px solid #E2E8F0;
  margin-top: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nk-print-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nk-print-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nk-print-table th,
.nk-print-table td {
  padding: 8px 10px;
  border: 1px solid #E2E8F0;
  text-align: left;
  vertical-align: top;
  font-size: 10px;
}

.nk-print-table thead th {
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  font-weight: 700;
  color: #2D3748;
  border-bottom: 2px solid #78C850;
}

.nk-print-photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.nk-print-photo-item {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  page-break-inside: avoid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.nk-print-photo-item img {
  width: 100%;
  height: auto;
  max-height: 180px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
}

.nk-print-photo-caption {
  font-size: 9px;
  color: #718096;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.3;
}

.nk-print-footer {
  margin-top: 30px;
  padding-top: 16px;
  border-top: 2px solid #E2E8F0;
  text-align: center;
  position: absolute;
  bottom: 18mm;
  left: 18mm;
  right: 18mm;
}

.nk-print-footer-brand {
  font-weight: 700;
  font-size: 11px;
  color: #2D3748;
  margin-bottom: 4px;
}

.nk-print-footer-text {
  font-size: 9px;
  color: #718096;
  line-height: 1.5;
}

.nk-print-footer-contact {
  font-size: 9px;
  color: #4A5568;
  margin-top: 6px;
}

.nk-page-number {
  position: absolute;
  bottom: 10mm;
  right: 18mm;
  font-size: 9px;
  color: #718096;
}

.nk-stat-box {
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  border-left: 4px solid #78C850;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nk-stat-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #718096;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.nk-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2D3748;
}
`

function sanitizeText(s: string): string {
  if (!s) return ""
  let t = s
  t = t.replace(/\b(refse|weafwe|ERFARF|lorem ipsum(?:[^.]*)?)\b/gi, "").trim()
  t = t.replace(/\bimage\.jpg\b/gi, "Photo evidence")
  t = t.replace(/\bN\/A\b/g, "Not applicable")
  t = t.replace(/\bYes\b(?!\s*\()/g, "Yes (confirmed)")
  t = t.replace(/\bNo\b(?!\s*\()/g, "No (not observed)")
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
  return t
}

function impactLabel(raw: unknown): string {
  if (raw == null) return ""
  const s = String(raw).toLowerCase().trim()
  if (/^(3|high|h)$/.test(s)) return "High"
  if (/^(2|medium|med|m)$/.test(s)) return "Medium"
  if (/^(1|low|l)$/.test(s)) return "Low"
  return sanitizeText(String(raw))
}

function enrichSummary(autoSummary: string): string {
  const cleaned = sanitizeText(autoSummary || "")
  if (!cleaned || /lorem/i.test(cleaned) || cleaned.length < 80) {
    return `<div class="nk-print-content">
      <p><strong>Executive Summary</strong></p>
      <ul style="margin-top: 12px; padding-left: 20px;">
        <li><strong>Risks Identified:</strong> Detailed in inspection sections</li>
        <li><strong>Immediate Corrective Actions:</strong> See recommendations</li>
        <li><strong>Next Steps & Owners:</strong> Assigned per section</li>
        <li><strong>Schedule Position:</strong> Current status documented</li>
      </ul>
    </div>`
  }
  return `<div class="nk-print-content">${cleaned}</div>`
}

function mountTemp(html: string): () => void {
  const el = document.createElement("div")
  el.className = "nk-print"
  const styleEl = document.createElement("style")
  styleEl.textContent = SAFE_PRINT_CSS
  el.appendChild(styleEl)

  const content = document.createElement("div")
  content.innerHTML = html

  el.appendChild(content)
  document.body.appendChild(el)
  return () => {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"))
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) {
        return img.decode?.().catch(() => {}) ?? Promise.resolve()
      }
      return new Promise<void>((res) => {
        img.addEventListener("load", () => res(), { once: true })
        img.addEventListener("error", () => res(), { once: true })
      })
    })
  )
}

async function renderNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default as any
  const canvas: HTMLCanvasElement = await html2canvas(node, {
    scale: 2,
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

function canvasToDataUrlSafe(
  canvas: HTMLCanvasElement
): { data: string; type: "PNG" | "JPEG" } {
  try {
    const png = canvas.toDataURL("image/png")
    if (png.startsWith("data:image/png")) return { data: png, type: "PNG" }
  } catch {
    /* ignore */
  }
  const jpg = canvas.toDataURL("image/jpeg", 0.95)
  return { data: jpg, type: "JPEG" }
}

async function renderPaginatedRootToPDF(root: HTMLElement, filename: string): Promise<void> {
  const mod = await import("jspdf")
  const pdf = new mod.jsPDF("p", "mm", "a4")

  const pages = Array.from(root.querySelectorAll<HTMLElement>(".nk-page"))

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderNodeToCanvas(pages[i])
    const { data, type } = canvasToDataUrlSafe(canvas)
    const imgW = 210
    const imgH = (canvas.height * imgW) / canvas.width

    if (i > 0) pdf.addPage()
    pdf.addImage(data, type, 0, 0, imgW, imgH, undefined, "FAST")
  }

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

async function generateMapImage(location: string): Promise<string> {
  try {
    const apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
    const encodedLocation = encodeURIComponent(location)
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedLocation}&zoom=15&size=600x300&markers=color:green%7C${encodedLocation}&key=${apiKey}`
    return `<img src="${mapUrl}" alt="Site Location Map" style="width:100%;height:100%;object-fit:cover;" />`
  } catch (error) {
    console.error("Map generation error:", error)
    return ""
  }
}

async function generateEnhancedSummaryHTML(
  form: AnyForm,
  autoSummary: string,
  photos: AnyPhoto[] = []
): Promise<string> {
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

  const summaryHTML = enrichSummary(autoSummary)

  const mapHTML = location ? await generateMapImage(location) : ""

  const coverAndDetailsPage = `
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
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Project Name</div>
          <div class="nk-print-meta-value">${project}</div>
        </div>
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Inspection Date</div>
          <div class="nk-print-meta-value">${inspectionDate}</div>
        </div>
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Location</div>
          <div class="nk-print-meta-value">${location || "Not specified"}</div>
        </div>
        <div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Workers On Site</div>
          <div class="nk-print-meta-value">${workers}</div>
        </div>
        ${inspector ? `<div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Inspector</div>
          <div class="nk-print-meta-value">${inspector}</div>
        </div>` : ""}
        ${impact ? `<div class="nk-print-meta-item">
          <div class="nk-print-meta-label">Impact Rating</div>
          <div class="nk-print-meta-value">${impact}</div>
        </div>` : ""}
      </div>

      ${mapHTML ? `<div class="nk-print-section">
        <h2 class="nk-print-section-title">Site Location</h2>
        <div class="nk-print-map">${mapHTML}</div>
      </div>` : ""}

      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Executive Summary</h2>
        ${summaryHTML}
      </div>

      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Key Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div class="nk-stat-box">
            <div class="nk-stat-label">Schedule Status</div>
            <div class="nk-stat-value" style="font-size: 14px;">${sanitizeText(form.scheduleStatus || "On Schedule")}</div>
          </div>
          <div class="nk-stat-box">
            <div class="nk-stat-label">Safety Rating</div>
            <div class="nk-stat-value" style="font-size: 14px;">${sanitizeText(form.safetyStatus || "Compliant")}</div>
          </div>
        </div>
      </div>
    </div>`

  const detailsPage = `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Inspection Details & Quality Survey</h2>
        <table class="nk-print-table">
          <thead>
            <tr>
              <th style="width:40%">Field</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Schedule Status</strong></td>
              <td>${sanitizeText(form.scheduleStatus || "On schedule")}</td>
            </tr>
            <tr>
              <td><strong>Impact Rating</strong></td>
              <td>${impact || "—"}</td>
            </tr>
            <tr>
              <td><strong>Materials Availability</strong></td>
              <td>${sanitizeText(form.materialsStatus || "All materials available")}</td>
            </tr>
            <tr>
              <td><strong>Weather Conditions</strong></td>
              <td>${sanitizeText(form.weather || "Not recorded")}</td>
            </tr>
            <tr>
              <td><strong>Safety Compliance</strong></td>
              <td>${sanitizeText(form.safetyStatus || "Compliant")}</td>
            </tr>
            <tr>
              <td><strong>Quality Rating</strong></td>
              <td>${sanitizeText(form.qualityRating || "—")}</td>
            </tr>
            <tr>
              <td><strong>Work Progress</strong></td>
              <td>${sanitizeText(form.workProgress || "—")}</td>
            </tr>
            <tr>
              <td><strong>General Notes</strong></td>
              <td>${sanitizeText(form.generalNotes || "—")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`

  const photoPages = photos.length
    ? `<div class="nk-page">
        <div class="nk-print-section">
          <h2 class="nk-print-section-title">Photo Evidence</h2>
          <div class="nk-print-photo-grid">
            ${photos
              .map((p, i) => {
                const fallback = `Photo ${i + 1}`
                const alt = sanitizeText(p.name || fallback)
                const cap = sanitizeText(p.name || fallback)
                return `
                  <div class="nk-print-photo-item">
                    <img src="${p.data}" alt="${alt}">
                    <div class="nk-print-photo-caption">${cap}</div>
                  </div>`
              })
              .join("")}
          </div>
        </div>
      </div>`
    : ""

  const signOffPage = `
    <div class="nk-page">
      <div class="nk-print-section">
        <h2 class="nk-print-section-title">Digital Sign-off & Acknowledgment</h2>
        <div class="nk-print-content">
          <table class="nk-print-table">
            <tbody>
              <tr>
                <td style="width:50%">
                  <strong>Inspector</strong><br/>
                  <div style="margin-top: 8px;">
                    Name: ${inspector || "—"}<br/>
                    Designation: ${sanitizeText(form.inspectorDesignation || "—")}<br/>
                    ID: ${sanitizeText(form.inspectorId || "—")}
                  </div>
                </td>
                <td style="width:50%">
                  <strong>Supervisor / Client Acknowledgment</strong><br/>
                  <div style="margin-top: 8px;">
                    Name: ${sanitizeText(form.supervisorName || "—")}<br/>
                    Designation: ${sanitizeText(form.supervisorDesignation || "—")}<br/>
                    ID: ${sanitizeText(form.clientId || "—")}
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
    </div>`

  return coverAndDetailsPage + detailsPage + photoPages + signOffPage
}

export async function generateFullReportPDF(
  form: AnyForm,
  photos: AnyPhoto[],
  signatureData: string | null
): Promise<void> {
  if (typeof window === "undefined") return
  if (!form?.projectName) {
    alert("Please enter Project Name.")
    return
  }

  const reportPreview = document.getElementById("reportPreview")
  if (!reportPreview) {
    alert("Report preview not found.")
    return
  }

  const sectionsHTML = Array.from(reportPreview.children)
    .map((section, index) => {
      if (index === 0) {
        return `<div class="nk-page">${section.outerHTML}</div>`
      }
      return `<div class="nk-page">${section.outerHTML}</div>`
    })
    .join("")

  const cleanup = mountTemp(sectionsHTML)
  try {
    const root = document.body.lastElementChild as HTMLElement
    await waitForImages(root)

    const filename = `ninekiwi_report_${String(form.projectName).replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
    await renderPaginatedRootToPDF(root, filename)
  } catch (e) {
    console.error(e)
    alert("PDF generation failed. Please try again.")
  } finally {
    cleanup()
  }
}

export async function generateSummaryPDF(form: AnyForm, summaryPhotos: AnyPhoto[]): Promise<void> {
  if (typeof window === "undefined") return
  if (!form?.projectName) {
    alert("Please enter Project Name.")
    return
  }

  const autoSummary = document.getElementById("autoSummary")?.innerHTML || ""
  const html = await generateEnhancedSummaryHTML(form, autoSummary, summaryPhotos)

  const cleanup = mountTemp(html)
  try {
    const root = document.body.lastElementChild as HTMLElement
    await waitForImages(root)

    const filename = `ninekiwi_summary_${String(form.projectName).replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
    await renderPaginatedRootToPDF(root, filename)
  } catch (e) {
    console.error(e)
    alert("Summary PDF generation failed. Please try again.")
  } finally {
    cleanup()
  }
}

export async function generateSummaryWord(_form: AnyForm, _summaryPhotos: AnyPhoto[]): Promise<void> {
  alert("Word export is not yet implemented.")
}
