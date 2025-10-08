"use client";

import React, { useMemo } from "react";
import MapCard from "./MapCard";

/* ===== Types (keep aligned with page.tsx) ===== */
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
  // Status & meta
  status?: "In Progress" | "Completed" | "On Track" | "";
  reportId?: string;
  inspectorName?: string;
  nameandAddressOfCompany?: string;
  clientName?: string;
  companyName?: string;
  contactPhone?: string;
  contactEmail?: string;
  inspectionDate?: string;
  startInspectionTime?: string;

  // Location
  location?: string; // free-form site address (fallback)
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  lat?: string | number;
  lon?: string | number;

  // Weather
  temperature?: string | number;
  humidity?: string | number;
  windSpeed?: string | number;
  weatherDescription?: string;

  // Radios / text
  weatherConditions?: string;
  safetyCompliance?: string;
  safetySignage?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;
  workerAttendance?: string;

  // Other fields
  numWorkers?: string | number;
  equipmentCondition?: string;

  // Notes
  additionalComments?: string;
  inspectorSummary?: string;
  recommendations?: string;

  // NEW narrative blocks
  backgroundManual?: string;
  backgroundAuto?: string;
  fieldObservationText?: string;

  // Signature
  signatureDateTime?: string;
}

interface ReportPreviewProps {
  form: FormData;
  sectionPhotos?: PhotoBuckets;
  signatureData?: string | null;
}

/* ===== Utils ===== */
function S(v: unknown): string {
  if (v == null) return "";
  const s = String(v).trim();
  return s;
}
function has(v: unknown): boolean {
  return S(v) !== "";
}
function formatTime(time?: string): string {
  const t = S(time);
  if (!t) return "";
  try {
    const d = new Date(`2000-01-01T${t}`);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return t;
  }
}

/* ===== Small primitives ===== */
const Line = React.memo<{ label: string; value?: React.ReactNode }>(({ label, value }) => {
  if (value == null) return null;
  const text = typeof value === "string" ? S(value) : value;
  if (text === "" || text == null) return null;

  return (
    <div className="flex gap-2 text-[13px] leading-5">
      <div className="font-semibold text-gray-800">{label}:</div>
      <div className="text-gray-700">{text}</div>
    </div>
  );
});
Line.displayName = "Line";

const Section: React.FC<{ title: string; children?: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = "",
}) => {
  if (!children) return null;
  if (Array.isArray(children) && children.every((c) => c == null || c === false)) return null;

  return (
    <section
      className={[
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        "print:shadow-none print:border print:break-inside-avoid",
        className,
      ].join(" ")}
    >
      <h2 className="mb-3 text-[17px] font-bold tracking-tight text-kiwi-dark text-center">
        {title}
      </h2>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
      {children}
    </section>
  );
};

/* Photo tile with stable aspect & nicer captions */
const PhotoGrid = React.memo<{ photos: UPhoto[] }>(({ photos }) => {
  if (!photos?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {photos.map((photo, idx) => (
        <figure
          key={`${photo.name}-${idx}`}
          className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm print:shadow-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="bg-white w-full aspect-[4/3] grid place-items-center p-2">
            <img
              src={photo.data}
              alt={photo.name || `photo_${idx + 1}`}
              className="max-h-full max-w-full object-contain"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>
          <figcaption className="px-3 pt-2 pb-3 text-center">
            <div className="text-xs font-semibold text-gray-800">
              Figure {photo.figureNumber ?? idx + 1}
              {photo.caption ? `: ${photo.caption}` : ""}
            </div>
            {has(photo.description) && (
              <div className="mt-1 text-[12px] text-gray-600 leading-5">{photo.description}</div>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
});
PhotoGrid.displayName = "PhotoGrid";

/* ===== Main ===== */
export default function ReportPreview({ form, sectionPhotos, signatureData }: ReportPreviewProps) {
  // Postal address, fallback to free-form location
  const postalAddress = useMemo(() => {
    const parts = [
      form?.streetAddress,
      [form?.city, form?.state].filter(Boolean).join(", "),
      [form?.country, form?.zipCode].filter(Boolean).join(" "),
    ]
      .filter((x) => has(x))
      .join(", ");
    return parts;
  }, [form?.streetAddress, form?.city, form?.state, form?.country, form?.zipCode]);

  const anyLocationProvided = useMemo(
    () => has(form?.location) || has(postalAddress),
    [form?.location, postalAddress]
  );

  const hasWeatherData = useMemo(
    () => has(form?.temperature) || has(form?.humidity) || has(form?.windSpeed) || has(form?.weatherDescription),
    [form?.temperature, form?.humidity, form?.windSpeed, form?.weatherDescription]
  );

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
        background: [],
        fieldObservation: [],
      },
    [sectionPhotos]
  );

  const observationTime = useMemo(() => formatTime(form?.startInspectionTime), [form?.startInspectionTime]);
  const mapAddress = useMemo(() => (postalAddress ? postalAddress : S(form?.location)), [postalAddress, form?.location]);

  const handleCoords = (lat: number, lon: number) => {
    // For preview only; the PDF uses export.ts logic
    console.log(`Map coords in preview: ${lat}, ${lon}`);
  };

  return (
    <div
      id="reportPreview"
      className="report-preview space-y-5 bg-transparent"
    >
      {/* ===== Status ===== */}
      <Section title="Field Condition Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
          <Line label="Status" value={S(form?.status)} />
          <Line label="Report ID" value={S(form?.reportId)} />
          <Line label="Name of Filed Inspector" value={S(form?.inspectorName)} />
          <Line label="Name and Address of Inspection Company" value={S(form?.nameandAddressOfCompany)} />
          <Line label="Client / Owner NAME" value={S(form?.clientName)} />
          <Line label="Company Name" value={S(form?.companyName)} />
          <Line label="Phone Number of Inspection Company" value={S(form?.contactPhone)} />
          <Line label="Email of Inspection Company" value={S(form?.contactEmail)} />
          <Line label="Date of Inspection" value={S(form?.inspectionDate)} />
          <Line label="Start Time of Inspection" value={observationTime} />
          <Line label="Inspection Property Address" value={S(form?.location)} />
        </div>
      </Section>

      {/* ===== Weather Conditions ===== */}
      {(anyLocationProvided || hasWeatherData || (buckets.weather?.length ?? 0) > 0) && (
        <Section title="Weather Conditions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Full Inspection Property Address" value={postalAddress} />
          </div>

          {hasWeatherData && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Line label="Temperature" value={has(form?.temperature) ? `${form?.temperature} °C` : undefined} />
              <Line label="Humidity" value={has(form?.humidity) ? `${form?.humidity} %` : undefined} />
              <Line label="Wind" value={has(form?.windSpeed) ? `${form?.windSpeed} m/s` : undefined} />
              <Line label="Description" value={S(form?.weatherDescription)} />
            </div>
          )}

          {mapAddress && (
            <div className="mt-3">
              <MapCard
                address={mapAddress}
                onCoords={handleCoords}
                className="nk-print-map w-full h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}

          {(buckets.weather?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.weather} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Background (NEW) ===== */}
      {(has(form?.backgroundManual) ||
        has(form?.backgroundAuto) ||
        (buckets.background?.length ?? 0) > 0) && (
        <Section title="Background">
          {has(form?.backgroundManual) && (
            <p className="text-[13px] leading-6 text-gray-800 text-justify mb-2">{S(form?.backgroundManual)}</p>
          )}
          {has(form?.backgroundAuto) && (
            <p className="text-[13px] leading-6 text-gray-800 text-justify italic">
              {S(form?.backgroundAuto)}
            </p>
          )}

          {(buckets.background?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.background} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Safety & Compliance ===== */}
      {(has(form?.safetyCompliance) || has(form?.safetySignage) || (buckets.safety?.length ?? 0) > 0) && (
        <Section title="Safety & Compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="All safety protocols & PPE followed?" value={S(form?.safetyCompliance)} />
            <Line label="Safety signage & access control in place?" value={S(form?.safetySignage)} />
          </div>
          {(buckets.safety?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.safety} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Personnel & Work Progress ===== */}
      {(has(form?.workerAttendance) || has(form?.scheduleCompliance) || has(form?.materialAvailability) || (buckets.work?.length ?? 0) > 0) && (
        <Section title="Personnel & Work Progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="All workers present & on time?" value={S(form?.workerAttendance)} />
            <Line label="Progress vs schedule" value={S(form?.scheduleCompliance)} />
            <Line label="Materials available & usable?" value={S(form?.materialAvailability)} />
          </div>
          {(buckets.work?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.work} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Field Observation (NEW) ===== */}
      {(has(form?.fieldObservationText) || (buckets.fieldObservation?.length ?? 0) > 0) && (
        <Section title="Field Observation">
          {has(form?.fieldObservationText) && (
            <p className="text-[13px] leading-6 text-gray-800 text-justify mb-2">
              {S(form?.fieldObservationText)}
            </p>
          )}
          {(buckets.fieldObservation?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.fieldObservation} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Inspection Support Equipment ===== */}
      {(buckets.equipment?.length ?? 0) > 0 && (
        <Section title="Inspection Support Equipment (if any)">
          <PhotoGrid photos={buckets.equipment} />
        </Section>
      )}

      {/* ===== Additional Inspection Notes ===== */}
      {(has(form?.additionalComments) || has(form?.inspectorSummary) || has(form?.recommendations) || (buckets.notes?.length ?? 0) > 0) && (
        <Section title="Additional Inspection Notes (if any)">
          <div className="space-y-1">
            <Line label="Additional comments / observations" value={S(form?.additionalComments)} />
            <Line label="Inspector's Summary (short)" value={S(form?.inspectorSummary)} />
            <Line label="Recommendations / next actions" value={S(form?.recommendations)} />
          </div>
          {(buckets.notes?.length ?? 0) > 0 && (
            <div className="mt-4">
              <PhotoGrid photos={buckets.notes} />
            </div>
          )}
        </Section>
      )}

      {/* ===== Additional Images ===== */}
      {(buckets.additional?.length ?? 0) > 0 && (
        <Section title="Additional Images (optional)">
          <PhotoGrid photos={buckets.additional} />
        </Section>
      )}

      {/* ===== Signature ===== */}
      {signatureData && (
        <Section title="Signature of Inspector">
          <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureData} alt="Signature of Inspector" className="max-h-24 object-contain" />
            <div className="text-[13px] text-gray-700">
              <div className="font-semibold">{S(form?.inspectorName) || "Inspector"}</div>
              <div className="text-gray-600">Signed on: {S(form?.signatureDateTime) || "—"}</div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
