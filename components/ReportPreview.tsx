"use client";
import React, { useMemo } from "react";
import MapCard from "./MapCard"; // Import MapCard component

interface UPhoto {
  name: string;
  data: string;
  caption?: string;
  description?: string;
  includeInSummary?: boolean;
  figureNumber?: number;
}

type PhotoBuckets = Record<string, UPhoto[]>;

interface FormData {
  // Status fields
  status?: string;
  reportId?: string;
  inspectorName?: string;
  supervisorName?: string;
  clientName?: string;
  contractorName?: string;
  companyName?: string;          // 👉 ADDED
  contactPhone?: string;
  contactEmail?: string;
  inspectionDate?: string;
  startInspectionTime?: string;

  // Location fields
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  lat?: string | number;
  lon?: string | number;

  // Weather fields
  temperature?: string | number;
  humidity?: string | number;
  windSpeed?: string | number;
  weatherDescription?: string;

  // Safety fields
  safetyCompliance?: string;
  safetySignage?: string;

  // Personnel & Work fields
  numWorkers?: string | number;
  workerAttendance?: string;
  workProgress?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;

  // Equipment & Quality fields
  equipmentCondition?: string;
  maintenanceStatus?: string;
  workmanshipQuality?: string;
  specificationCompliance?: string;

  // Incidents fields
  incidentsHazards?: string;
  siteHousekeeping?: string;
  stakeholderVisits?: string;

  // Notes fields
  additionalComments?: string;
  inspectorSummary?: string;
  recommendations?: string;

  // Signature fields
  signatureDateTime?: string;
}

interface ReportPreviewProps {
  form: FormData;
  sectionPhotos?: PhotoBuckets;
  signatureData?: string | null;
}

interface LineProps {
  label: string;
  value?: React.ReactNode;
}

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

interface PhotoGridProps {
  photos: UPhoto[];
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

/** Safely converts value to trimmed string */
function normalizeString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

/** Format time to AM/PM display */
function formatTime(time: string): string {
  if (!time) return "";
  try {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return time;
  }
}

/* ==========================================
   COMPONENT DEFINITIONS
   ========================================== */

/** Displays a labeled data line */
const Line = React.memo<LineProps>(({ label, value }) => {
  if (value == null) return null;

  const text = typeof value === "string" ? value.trim() : value;
  if (text === "" || text == null) return null;

  return (
    <div className="flex gap-2 text-sm">
      <div className="font-semibold">{label}:</div>
      <div className="text-kiwi-gray">{text}</div>
    </div>
  );
});
Line.displayName = "Line";

/** Section wrapper with conditional rendering */
const Section = React.memo<SectionProps>(({ title, children }) => {
  if (!children) return null;
  if (Array.isArray(children) && children.every((c) => c == null || c === false)) {
    return null;
  }

  return (
    <section className="form-section p-5 avoid-break">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">
        {title}
      </h2>
      {children}
    </section>
  );
});
Section.displayName = "Section";

/** Photo grid with figure numbering */
const PhotoGrid = React.memo<PhotoGridProps>(({ photos }) => {
  if (!photos?.length) return null;

  return (
    <div className="photo-grid nk-print-photo-grid">
      {photos.map((photo, idx) => (
        <div
          key={`${photo.name}-${idx}`}
          className="photo-item nk-print-photo-item"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.data}
            alt={photo.name || `photo_${idx + 1}`}
            className="w-full max-h-60 object-contain rounded-md bg-white"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            loading="eager"
          />
          <div className="nk-print-photo-caption">
            Figure {photo.figureNumber ?? idx + 1}: {photo.caption || photo.name}
          </div>
          {photo.description && (
            <div className="nk-print-photo-description">
              {photo.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
PhotoGrid.displayName = "PhotoGrid";

/* ==========================================
   MAIN COMPONENT
   ========================================== */

export default function ReportPreview({
  form,
  sectionPhotos,
  signatureData,
}: ReportPreviewProps): JSX.Element {
  // Memoized address string
  const address = useMemo(() => {
    const parts = [
      form?.streetAddress,
      [form?.city, form?.state].filter(Boolean).join(", "),
      [form?.country, form?.zipCode].filter(Boolean).join(" "),
    ]
      .filter((x) => !!x && normalizeString(x).length > 0)
      .join(", ");
    return parts;
  }, [form?.streetAddress, form?.city, form?.state, form?.country, form?.zipCode]);

  // Check for weather data presence
  const hasWeatherData = useMemo(
    () =>
      normalizeString(form?.temperature) !== "" ||
      normalizeString(form?.humidity) !== "" ||
      normalizeString(form?.windSpeed) !== "" ||
      normalizeString(form?.weatherDescription) !== "",
    [form?.temperature, form?.humidity, form?.windSpeed, form?.weatherDescription]
  );

  // Check for location data presence
  const hasLocationData = useMemo(
    () => normalizeString(form?.location) !== "" || address !== "",
    [form?.location, address]
  );

  // Photo buckets with defaults
  const buckets: PhotoBuckets = useMemo(
    () =>
      sectionPhotos || {
        weather: [],
        safety: [],
        work: [],
        equipment: [],
        incidents: [],
        quality: [],
        notes: [],
        evidence: [],
        additional: [],
      },
    [sectionPhotos]
  );

  // Format observation time for display
  const observationTime = useMemo(
    () => formatTime(form?.startInspectionTime || ""),
    [form?.startInspectionTime]
  );

  // Handle coordinates from MapCard (optional)
  const handleCoords = (lat: number, lon: number) => {
    // You can use lat/lon here if needed, e.g., update form state or store elsewhere
    console.log(`Coordinates received: ${lat}, ${lon}`);
  };

  return (
    <div id="reportPreview" className="report-preview p-4 md:p-6 space-y-6">
      {/* Status & Contact */}
      <Section title="Filed Condition Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Line label="Status" value={normalizeString(form?.status)} />
          <Line label="Report ID" value={normalizeString(form?.reportId)} />
          <Line label="Name of Field Inspector" value={normalizeString(form?.inspectorName)} />
          
          <Line label="Client / Owner" value={normalizeString(form?.clientName)} />
          <Line label="Contractor" value={normalizeString(form?.contractorName)} />
          <Line label="Company Name" value={normalizeString(form?.companyName)} /> {/* 👉 ADDED */}
          <Line label="Phone Number of Inspection Company" value={normalizeString(form?.contactPhone)} />
          <Line label="Email of Inspection Company" value={normalizeString(form?.contactEmail)} />
          <Line label="Date of Inspection" value={normalizeString(form?.inspectionDate)} />
          <Line label="Start Time of Inspection" value={observationTime} />
        </div>
      </Section>

      {/* Location & Weather + Map */}
      {(hasLocationData || hasWeatherData) && (
        <Section title="Location & Weather">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Name and Address of Inspection Company" value={normalizeString(form?.location)} />
            <Line label="Address" value={address} />
          </div>

          {hasWeatherData && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Line
                label="Temperature"
                value={
                  normalizeString(form?.temperature) !== ""
                    ? `${form?.temperature} °C`
                    : undefined
                }
              />
              <Line
                label="Humidity"
                value={
                  normalizeString(form?.humidity) !== "" ? `${form?.humidity} %` : undefined
                }
              />
              <Line
                label="Wind"
                value={
                  normalizeString(form?.windSpeed) !== "" ? `${form?.windSpeed} m/s` : undefined
                }
              />
              <Line label="Description" value={normalizeString(form?.weatherDescription)} />
            </div>
          )}

          {address && (
            <div className="mt-4">
              <MapCard
                address={address}
                onCoords={handleCoords}
                className="nk-print-map"
              />
            </div>
          )}

          {buckets.weather?.length > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.weather} />
            </div>
          )}
        </Section>
      )}

      {/* Safety */}
      {(normalizeString(form?.safetyCompliance) ||
        normalizeString(form?.safetySignage) ||
        buckets.safety?.length > 0) && (
        <Section title="Safety & Compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Safety Compliance" value={normalizeString(form?.safetyCompliance)} />
            <Line label="Safety Signage" value={normalizeString(form?.safetySignage)} />
          </div>
          {buckets.safety?.length > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.safety} />
            </div>
          )}
        </Section>
      )}

      {/* Personnel & Work */}
      {(normalizeString(form?.numWorkers) ||
        normalizeString(form?.workerAttendance) ||
        normalizeString(form?.workProgress) ||
        normalizeString(form?.scheduleCompliance) ||
        normalizeString(form?.materialAvailability) ||
        buckets.work?.length > 0) && (
        <Section title="Personnel & Work Progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Workers on site" value={normalizeString(form?.numWorkers)} />
            <Line label="Attendance" value={normalizeString(form?.workerAttendance)} />
            <Line label="Schedule" value={normalizeString(form?.scheduleCompliance)} />
            <Line label="Materials" value={normalizeString(form?.materialAvailability)} />
            <Line label="Progress" value={normalizeString(form?.workProgress)} />
          </div>
          {buckets.work?.length > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.work} />
            </div>
          )}
        </Section>
      )}

      {/* Equipment & Quality */}
      {(normalizeString(form?.equipmentCondition) ||
        normalizeString(form?.maintenanceStatus) ||
        normalizeString(form?.workmanshipQuality) ||
        normalizeString(form?.specificationCompliance) ||
        buckets.equipment?.length > 0 ||
        buckets.quality?.length > 0) && (
        <Section title="Inspection Support Equipment (if any)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Equipment Condition" value={normalizeString(form?.equipmentCondition)} />
            <Line label="Maintenance" value={normalizeString(form?.maintenanceStatus)} />
            <Line label="Workmanship" value={normalizeString(form?.workmanshipQuality)} />
            <Line
              label="Per Specs"
              value={normalizeString(form?.specificationCompliance)}
            />
          </div>
          {(buckets.equipment?.length > 0 || buckets.quality?.length > 0) && (
            <div className="mt-4">
              <PhotoGrid photos={[...(buckets.equipment || []), ...(buckets.quality || [])]} />
            </div>
          )}
        </Section>
      )}

      {/* Incidents & Site
      {(normalizeString(form?.incidentsHazards) ||
        normalizeString(form?.siteHousekeeping) ||
        normalizeString(form?.stakeholderVisits) ||
        buckets.incidents?.length > 0) && (
        <Section title="Incidents & Site Conditions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Incidents / Hazards" value={normalizeString(form?.incidentsHazards)} />
            <Line label="Housekeeping" value={normalizeString(form?.siteHousekeeping)} />
            <Line label="Stakeholder Visits" value={normalizeString(form?.stakeholderVisits)} />
          </div>
          {buckets.incidents?.length > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.incidents} />
            </div>
          )}
        </Section>
      )} */}

      {/* Notes */}
      {(normalizeString(form?.additionalComments) ||
        normalizeString(form?.inspectorSummary) ||
        normalizeString(form?.recommendations) ||
        buckets.notes?.length > 0) && (
        <Section title="Additional Inspection Notes (if any)">
          <div className="space-y-2">
            <Line label="Comments" value={normalizeString(form?.additionalComments)} />
            <Line label="Inspector's Summary" value={normalizeString(form?.inspectorSummary)} />
            <Line label="Recommendations" value={normalizeString(form?.recommendations)} />
          </div>
          {buckets.notes?.length > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.notes} />
            </div>
          )}
        </Section>
      )}

      {/* Photo Evidence */}
      {buckets.evidence?.length > 0 && (
        <Section title="Photo Evidence">
          <PhotoGrid photos={buckets.evidence} />
        </Section>
      )}

      {/* Additional Images */}
      {buckets.additional?.length > 0 && (
        <Section title="Additional Images">
          <PhotoGrid photos={buckets.additional} />
        </Section>
      )}

      {/* Signature */}
      {signatureData && (
        <Section title="Signature of Inspector">
          <div className="signature-pad p-4 rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureData}
              alt="Signature of Inspector"
              className="max-h-32 object-contain"
            />
            <div className="text-sm text-kiwi-gray mt-2">
              Signed on: {form?.signatureDateTime || "—"}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
