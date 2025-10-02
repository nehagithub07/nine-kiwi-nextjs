"use client";
import React, { useMemo } from "react";

type UPhoto = {
  name: string;
  data: string;
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
};

export default function AutoSummary({ form, photos }: { form: any; photos?: UPhoto[] }) {
  const summary = useMemo(() => {
    const status = (form?.status || "").trim();
    const location = (form?.location || "").trim();
    const inspector = (form?.inspectorName || "").trim();

    const safetyCompliance = (form?.safetyCompliance || "").trim();
    const safetySignage = (form?.safetySignage || "").trim();

    const workProgress = (form?.workProgress || "").trim();
    const scheduleCompliance = (form?.scheduleCompliance || "").trim();
    const materialAvailability = (form?.materialAvailability || "").trim();

    const workmanshipQuality = (form?.workmanshipQuality || "").trim();
    const equipmentCondition = (form?.equipmentCondition || "").trim();

    const incidentsHazards = (form?.incidentsHazards || "").trim();
    const siteHousekeeping = (form?.siteHousekeeping || "").trim();

    const recommendations = (form?.recommendations || "").trim();
    const additionalComments = (form?.additionalComments || "").trim();
    const inspectorSummary = (form?.inspectorSummary || "").trim();

    const temp = form?.temperature ? parseFloat(form.temperature) : null;
    const weatherDesc = (form?.weatherDescription || "").trim();
    let weatherNote = "";
    if (temp !== null && weatherDesc) {
      if (temp < 5 || weatherDesc.toLowerCase().includes("rain") || weatherDesc.toLowerCase().includes("storm")) {
        weatherNote = `<div class="text-sm text-gray-600 italic mb-2">Weather conditions (${temp}°C, ${weatherDesc}) may have impacted site activities.</div>`;
      } else if (temp > 15 && temp < 30) {
        weatherNote = `<div class="text-sm text-gray-600 italic mb-2">Favorable weather conditions (${temp}°C, ${weatherDesc}) supported site progress.</div>`;
      }
    }

    const rows = [];

    if (status || location) {
      rows.push(`<li><strong>Project Status:</strong> ${status || "In progress"} at ${location || "site"}</li>`);
    }

    if (safetyCompliance && safetyCompliance.toLowerCase() === "yes") {
      rows.push(`<li><strong>Safety:</strong> All safety protocols and PPE requirements met${safetySignage && safetySignage.toLowerCase() === "yes" ? " with proper signage in place" : ""}</li>`);
    } else if (safetyCompliance && safetyCompliance.toLowerCase() === "no") {
      rows.push(`<li><strong>Safety Concern:</strong> Safety protocols not fully complied with - immediate attention required</li>`);
    }

    if (scheduleCompliance || materialAvailability) {
      const schedStatus = scheduleCompliance === "Ahead" ? "ahead of schedule" : scheduleCompliance === "Behind" ? "behind schedule" : "on track";
      const matStatus = materialAvailability === "Yes" ? "all materials available" : materialAvailability === "No" ? "material shortages reported" : "partial material availability";
      rows.push(`<li><strong>Progress:</strong> Project is ${schedStatus}${materialAvailability ? `, ${matStatus}` : ""}</li>`);
    }

    if (workProgress) {
      rows.push(`<li><strong>Current Activities:</strong> ${workProgress}</li>`);
    }

    if (workmanshipQuality) {
      rows.push(`<li><strong>Quality:</strong> Workmanship rated as ${workmanshipQuality}${equipmentCondition ? `, equipment condition: ${equipmentCondition}` : ""}</li>`);
    }

    if (incidentsHazards === "Yes") {
      rows.push(`<li><strong>⚠️ Incidents/Hazards:</strong> Incidents or hazards reported - review required</li>`);
    } else if (incidentsHazards === "No") {
      rows.push(`<li><strong>Safety Record:</strong> No incidents or hazards reported today</li>`);
    }

    if (siteHousekeeping) {
      rows.push(`<li><strong>Site Conditions:</strong> Housekeeping and cleanliness rated as ${siteHousekeeping}</li>`);
    }

    if (photos && photos.length > 0) {
      const photoCount = photos.filter(p => p.includeInSummary).length || photos.length;
      rows.push(`<li><strong>Documentation:</strong> ${photoCount} photo${photoCount !== 1 ? "s" : ""} included for reference</li>`);
    }

    if (recommendations) {
      rows.push(`<li><strong>Recommendations:</strong> ${recommendations}</li>`);
    }

    if (inspectorSummary) {
      rows.push(`<li><strong>Inspector Notes:</strong> ${inspectorSummary}</li>`);
    }

    if (additionalComments && !inspectorSummary) {
      rows.push(`<li><strong>Additional Notes:</strong> ${additionalComments}</li>`);
    }

    if (rows.length === 0) {
      return `<div class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">Complete the inspection form fields above to generate an executive summary. The summary will automatically update as you fill in details.</div>`;
    }

    return `
      <div class="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        ${weatherNote}
        <ul class="list-disc ml-5 space-y-2 text-sm">${rows.join("")}</ul>
        ${inspector ? `<div class="mt-3 text-xs text-gray-600 border-t border-green-200 pt-2">Inspected by: <strong>${inspector}</strong></div>` : ""}
      </div>
    `;
  }, [form, photos]);

  return <div id="autoSummary" dangerouslySetInnerHTML={{ __html: summary }} />;
}
