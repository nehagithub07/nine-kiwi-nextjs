"use client";

import Image from "next/image";
import MapCard from "@/components/MapCard";

type UPhoto = {
  name: string;
  data: string;
  caption?: string;
  includeInSummary?: boolean;
};

function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString() : new Date().toLocaleDateString();
}

// Supports "yesno" or "text" only (no stars)
function flexAnswer(id: string, form: any) {
  const mode: "yesno" | "text" = form?.flexibleModes?.[id] || "yesno";
  const v = (form?.[id] ?? "").toString().trim();
  return v || "N/A";
}

function SectionPhotoGrid({ photos }: { photos: UPhoto[] }) {
  if (!photos?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-6">
      {photos.map((p, i) => (
        <figure key={`${p.name}-${i}`} className="border rounded overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.data} alt={p.name} className="w-full h-40 object-cover" />
          <figcaption className="text-xs p-2 text-center text-gray-600">
            {p.caption?.trim() ? p.caption : p.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function ReportPreview({
  form,
  sectionPhotos,
  signatureData,
}: {
  form: any;
  sectionPhotos: Record<
    "weather" | "safety" | "work" | "equipment" | "incidents" | "quality" | "notes" | "evidence",
    UPhoto[]
  >;
  signatureData: string | null;
}) {
  if (!form?.projectName) {
    return (
      <div id="reportPreview" className="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-96">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
          </svg>
          <p className="text-lg font-medium">Report Preview</p>
          <p className="text-sm mt-2">Fill the form to see your report</p>
        </div>
      </div>
    );
  }

  const chips = [
    form.reportId && `Report # ${form.reportId}`,
    form.scheduleCompliance && `Schedule: ${form.scheduleCompliance}`,
    form.materialAvailability && `Materials: ${form.materialAvailability}`,
    form.incidentsHazards && `Incidents: ${form.incidentsHazards}`,
  ].filter(Boolean) as string[];

  return (
    <div id="reportPreview" className="border border-gray-200 rounded-lg p-6 bg-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-5 border-b-2 border-kiwi-green">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center">
                <Image src="/logo.png" alt="nineKiwi_logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-kiwi-dark">NineKiwi Inspection Report</h1>
              <p className="text-xs text-kiwi-gray">Generated {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right text-sm space-x-1">
            {chips.map((c, i) => (
              <span key={i} className="pill inline-block">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Project & Contact */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Project & Contact</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Project:</strong> {form.projectName || "N/A"}
          </div>
          <div>
            <strong>Date:</strong> {fmtDate(form.inspectionDate)}
          </div>
          <div>
            <strong>Client:</strong> {form.clientName || "N/A"}
          </div>
          <div>
            <strong>Contractor:</strong> {form.contractorName || "N/A"}
          </div>
          <div>
            <strong>Inspector:</strong> {form.inspectorName || "N/A"}
          </div>
          <div>
            <strong>Supervisor:</strong> {form.supervisorName || "N/A"}
          </div>
          <div>
            <strong>Phone:</strong> {form.contactPhone || "N/A"}
          </div>
          <div>
            <strong>Email:</strong> {form.contactEmail || "N/A"}
          </div>
          <div className="col-span-2">
            <strong>Location:</strong> {form.location || "N/A"}
          </div>
        </div>
      </div>

      {/* Weather + Map */}
      {(form.temperature || form.weatherDescription || form.weatherConditions || form.location) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Weather</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {form.weatherDescription && (
              <div>
                <strong>Description:</strong> {form.weatherDescription}
              </div>
            )}
            {(form.weatherConditions || form.flexibleModes?.weatherConditions) && (
              <div>
                <strong>Impact:</strong> {flexAnswer("weatherConditions", form)}
              </div>
            )}
            {form.temperature && (
              <div>
                <strong>Temp:</strong> {form.temperature}°C
              </div>
            )}
            {form.humidity && (
              <div>
                <strong>Humidity:</strong> {form.humidity}%
              </div>
            )}
            {form.windSpeed && (
              <div>
                <strong>Wind:</strong> {form.windSpeed} km/h
              </div>
            )}
            {form.weatherTime && (
              <div>
                <strong>Observation Time:</strong> {form.weatherTime}
              </div>
            )}
          </div>

          {form.location && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-kiwi-dark mb-2">Site Map</h3>
              <MapCard
                className="rounded-lg overflow-hidden"
                address={form.location}
                onCoords={() => {
                  /* preview is read-only */
                }}
              />
            </div>
          )}

          {/* Weather photos */}
          <div className="mt-4">
            <SectionPhotoGrid photos={sectionPhotos.weather} />
          </div>
        </div>
      )}

      {/* Site Inspection – narrative (no tables) */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Site Inspection</h2>

        {/* 2.1 Safety & Compliance */}
        {(form.safetyCompliance ||
          form.safetySignage ||
          form.numWorkers ||
          form.workerAttendance ||
          (sectionPhotos.safety?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.1 Safety & Compliance</h3>
            <div className="text-sm leading-relaxed space-y-2 pl-4">
              {(form.safetyCompliance || form.safetySignage) && (
                <p>
                  <strong>Inspection Results:</strong>{" "}
                  {form.safetyCompliance && <>PPE & protocol: {flexAnswer("safetyCompliance", form)}. </>}
                  {form.safetySignage && <>Signage & access: {flexAnswer("safetySignage", form)}.</>}
                </p>
              )}
              {(form.numWorkers || form.workerAttendance) && (
                <p>
                  {form.numWorkers && <>Workers on site: {form.numWorkers}. </>}
                  {form.workerAttendance && <>Attendance/punctuality: {form.workerAttendance}.</>}
                </p>
              )}
            </div>
            <div className="mt-3">
              <SectionPhotoGrid photos={sectionPhotos.safety} />
            </div>
          </div>
        )}

        {/* 2.2 Schedule & Progress */}
        {(form.scheduleCompliance ||
          form.materialAvailability ||
          form.workProgress ||
          (sectionPhotos.work?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.2 Schedule & Progress</h3>
            <div className="text-sm leading-relaxed space-y-2 pl-4">
              {(form.scheduleCompliance || form.materialAvailability) && (
                <p>
                  <strong>Inspection Results:</strong>{" "}
                  {form.scheduleCompliance && <>Schedule: {form.scheduleCompliance}. </>}
                  {form.materialAvailability && <>Materials: {form.materialAvailability}.</>}
                </p>
              )}
              {form.workProgress && (
                <p>
                  <strong>Work Progress Summary:</strong>
                  <br />
                  <span className="whitespace-pre-line">{form.workProgress}</span>
                </p>
              )}
            </div>
            <div className="mt-3">
              <SectionPhotoGrid photos={sectionPhotos.work} />
            </div>
          </div>
        )}

        {/* 2.3 Equipment & Maintenance */}
        {(form.equipmentCondition ||
          form.maintenanceStatus ||
          (sectionPhotos.equipment?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.3 Equipment & Maintenance</h3>
            <div className="text-sm leading-relaxed space-y-2 pl-4">
              {(form.equipmentCondition || form.maintenanceStatus) && (
                <p>
                  <strong>Inspection Results:</strong>{" "}
                  {form.equipmentCondition && <>Equipment condition: {flexAnswer("equipmentCondition", form)}. </>}
                  {form.maintenanceStatus && <>Maintenance status: {form.maintenanceStatus}.</>}
                </p>
              )}
            </div>
            <div className="mt-3">
              <SectionPhotoGrid photos={sectionPhotos.equipment} />
            </div>
          </div>
        )}

        {/* 2.4 Quality & Workmanship */}
        {(form.workmanshipQuality ||
          form.specificationCompliance ||
          (sectionPhotos.quality?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.4 Quality & Workmanship</h3>
            <div className="text-sm leading-relaxed space-y-2 pl-4">
              {(form.workmanshipQuality || form.specificationCompliance) && (
                <p>
                  <strong>Inspection Results:</strong>{" "}
                  {form.workmanshipQuality && <>Workmanship: {flexAnswer("workmanshipQuality", form)}. </>}
                  {form.specificationCompliance && <>Per specifications: {form.specificationCompliance}.</>}
                </p>
              )}
            </div>
            <div className="mt-3">
              <SectionPhotoGrid photos={sectionPhotos.quality} />
            </div>
          </div>
        )}

        {/* 2.5 Site Conditions & Housekeeping */}
        {(form.siteHousekeeping ||
          form.incidentsHazards ||
          form.stakeholderVisits ||
          (sectionPhotos.incidents?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.5 Site Conditions & Housekeeping</h3>
            <div className="text-sm leading-relaxed space-y-2 pl-4">
              {(form.siteHousekeeping || form.incidentsHazards) && (
                <p>
                  <strong>Inspection Results:</strong>{" "}
                  {form.siteHousekeeping && <>Housekeeping: {flexAnswer("siteHousekeeping", form)}. </>}
                  {form.incidentsHazards && <>Incidents/Hazards: {form.incidentsHazards}.</>}
                  {form.stakeholderVisits && <> Visits: {form.stakeholderVisits}.</>}
                </p>
              )}
            </div>
            <div className="mt-3">
              <SectionPhotoGrid photos={sectionPhotos.incidents} />
            </div>
          </div>
        )}

        {/* 2.6 Additional Observations */}
        {(form.additionalComments || (sectionPhotos.notes?.length ?? 0) > 0) && (
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-kiwi-dark mb-2">2.6 Additional Observations</h3>
            {form.additionalComments && (
              <div className="text-sm leading-relaxed pl-4 mb-3">
                <p className="whitespace-pre-line">{form.additionalComments}</p>
              </div>
            )}
            <SectionPhotoGrid photos={sectionPhotos.notes} />
          </div>
        )}
      </div>

      {/* Quality Survey */}
      {(form.qualityRating || form.communicationRating || form.recommendationRating || form.improvementAreas) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Quality Survey</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {form.qualityRating && (
              <div>
                <strong>Overall Quality:</strong> {flexAnswer("qualityRating", form)}
              </div>
            )}
            {form.communicationRating && (
              <div>
                <strong>Team Communication:</strong> {flexAnswer("communicationRating", form)}
              </div>
            )}
            {form.recommendationRating && (
              <div>
                <strong>Recommend Team:</strong> {form.recommendationRating}
              </div>
            )}
            {form.improvementAreas && (
              <div className="col-span-2">
                <strong>Improvement Areas:</strong>{" "}
                <span className="whitespace-pre-line">{form.improvementAreas}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Photo Evidence (unchanged UI, just rendered here) */}
      {(sectionPhotos.evidence?.length ?? 0) > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Photo Evidence</h2>
          <SectionPhotoGrid photos={sectionPhotos.evidence} />
        </div>
      )}

      {/* Summary & Recommendations */}
      {(form.inspectorSummary || form.recommendations) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">
            Summary & Recommendations
          </h2>
          {form.inspectorSummary && (
            <div className="mb-3">
              <strong>Summary:</strong>
              <br />
              <span className="whitespace-pre-line">{form.inspectorSummary}</span>
            </div>
          )}
          {form.recommendations && (
            <div>
              <strong>Recommendations:</strong>
              <br />
              <span className="whitespace-pre-line">{form.recommendations}</span>
            </div>
          )}
        </div>
      )}

      {/* Signature */}
      {signatureData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Digital Sign-off</h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm font-semibold mb-2">Inspector Signature:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureData} className="border rounded" style={{ maxHeight: 100 }} alt="Signature" />
            </div>
            <div className="text-sm">
              <p>
                <strong>Signed By:</strong> {form.inspectorName || "N/A"}
              </p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {form.signatureDateTime ? new Date(form.signatureDateTime).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
