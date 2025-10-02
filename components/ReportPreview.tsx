// components/ReportPreview.tsx
"use client";
import React, { useMemo } from "react";

type UPhoto = {
  name: string;
  data: string;
  caption?: string;
  description?: string;
  includeInSummary?: boolean;
  figureNumber?: number;
};
type PhotoBuckets = Record<string, UPhoto[]>;

type Props = {
  form: any;
  sectionPhotos?: PhotoBuckets;
  signatureData?: string | null;
};

function Line({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : value;
  if (text === "" || text == null) return null;
  return (
    <div className="flex gap-2 text-sm">
      <div className="font-semibold">{label}:</div>
      <div className="text-kiwi-gray">{text}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  if (!children) return null;
  if (Array.isArray(children) && children.every((c) => c == null || c === false)) return null;
  return (
    <section className="form-section p-5 avoid-break">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PhotoGrid({ photos }: { photos: UPhoto[] }) {
  if (!photos?.length) return null;
  return (
    <div className="photo-grid nk-print-photo-grid">
      {photos.map((p, idx) => (
        <div key={idx} className="photo-item nk-print-photo-item p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.data}
            alt={p.name || `photo_${idx + 1}`}
            className="w-full h-40 object-cover rounded-md"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            loading="eager"
          />
          <div className="mt-2 text-sm font-semibold nk-print-photo-caption">
            Figure {p.figureNumber ?? idx + 1}: {p.caption || p.name}
          </div>
          {p.description ? (
            <div className="nk-print-photo-description">{p.description}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Build a static map URL for live preview + PDF (CORS-friendly).
 *  Prefers lat/lon if present; falls back to address query. */
function buildStaticMapURL(form: any): string | null {
  const gkey = process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY?.trim();

  // Prefer coordinates only if they are truly present (not empty strings)
  const latStr = String(form?.lat ?? "").trim();
  const lonStr = String(form?.lon ?? "").trim();
  const lat = Number(latStr);
  const lon = Number(lonStr);
  const hasCoords = latStr !== "" && lonStr !== "" && Number.isFinite(lat) && Number.isFinite(lon);

  // Otherwise compose an address string
  const addressParts = [
    form?.streetAddress,
    [form?.city, form?.state].filter(Boolean).join(", "),
    [form?.country, form?.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const query: string | null =
    hasCoords
      ? `${lat},${lon}`
      : (form?.location && String(form.location).trim()) ||
        (addressParts.length ? addressParts.join(", ") : "") ||
        null;

  if (!query) return null;

  if (gkey) {
    // Google Static Maps (supports coords or address) — crisp for PDF via scale=2
    return hasCoords
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=800x400&scale=2&markers=color:green|${lat},${lon}&key=${gkey}`
      : `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
          query
        )}&zoom=15&size=800x400&scale=2&markers=color:green|${encodeURIComponent(query)}&key=${gkey}`;
  }

  // OSM fallback (no key). Coordinate URLs are preferred and more accurate.
  if (hasCoords) {
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=800x400&markers=${lat},${lon},lightgreen-pushpin`;
  }
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(
    query
  )}&zoom=15&size=800x400&markers=${encodeURIComponent(query)},lightgreen-pushpin`;
}

export default function ReportPreview({ form, sectionPhotos, signatureData }: Props) {
  const any = (s?: string) => (typeof s === "string" ? s.trim() : "");

  const addr = useMemo(() => {
    const parts = [
      form?.streetAddress,
      [form?.city, form?.state].filter(Boolean).join(", "),
      [form?.country, form?.zipCode].filter(Boolean).join(" "),
    ]
      .filter((x) => !!x && String(x).trim().length > 0)
      .join(" • ");
    return parts;
  }, [form?.streetAddress, form?.city, form?.state, form?.country, form?.zipCode]);

  const mapURL = useMemo(() => buildStaticMapURL(form), [form]);

  const weatherMetaPresent =
    any(form?.temperature) || any(form?.humidity) || any(form?.windSpeed) || any(form?.weatherDescription);

  const locationOrAddrPresent = !!(any(form?.location) || addr);

  const buckets: PhotoBuckets = sectionPhotos || {
    weather: [],
    safety: [],
    work: [],
    equipment: [],
    incidents: [],
    quality: [],
    notes: [],
    evidence: [],
    additional: [],
  };

  return (
    <div id="reportPreview" className="report-preview p-4 md:p-6 space-y-6">
      {/* Status & Contact */}
      <Section title="Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Line label="Status" value={any(form?.status)} />
          <Line label="Report ID" value={any(form?.reportId)} />
          <Line label="Inspector" value={any(form?.inspectorName)} />
          <Line label="Supervisor" value={any(form?.supervisorName)} />
          <Line label="Client" value={any(form?.clientName)} />
          <Line label="Contractor" value={any(form?.contractorName)} />
          <Line label="Phone" value={any(form?.contactPhone)} />
          <Line label="Email" value={any(form?.contactEmail)} />
          <Line label="Date" value={any(form?.inspectionDate)} />
          <Line label="Observation Time" value={any(form?.weatherTime)} />
        </div>
      </Section>

      {/* Location + Weather + MAP */}
      {(locationOrAddrPresent || weatherMetaPresent || mapURL) && (
        <Section title="Location & Weather">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Location" value={any(form?.location)} />
            <Line label="Address" value={addr} />
          </div>

          {weatherMetaPresent && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Line label="Temperature" value={any(form?.temperature) && `${form.temperature} °C`} />
              <Line label="Humidity" value={any(form?.humidity) && `${form.humidity} %`} />
              <Line label="Wind" value={any(form?.windSpeed) && `${form.windSpeed} m/s`} />
              <Line label="Description" value={any(form?.weatherDescription)} />
            </div>
          )}

          {mapURL && (
            <div className="nk-print-map mt-4" style={{ minHeight: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapURL}
                alt="Site Location Map"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
          )}

          <div className="mt-4">
            <PhotoGrid photos={buckets.weather || []} />
          </div>
        </Section>
      )}

      {/* Safety */}
      {(any(form?.safetyCompliance) || any(form?.safetySignage) || (buckets.safety && buckets.safety.length)) && (
        <Section title="Safety & Compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Safety Compliance" value={any(form?.safetyCompliance)} />
            <Line label="Safety Signage" value={any(form?.safetySignage)} />
          </div>
          <div className="mt-4">
            <PhotoGrid photos={buckets.safety || []} />
          </div>
        </Section>
      )}

      {/* Personnel & Work */}
      {(any(form?.numWorkers) ||
        any(form?.workerAttendance) ||
        any(form?.workProgress) ||
        any(form?.scheduleCompliance) ||
        any(form?.materialAvailability) ||
        (buckets.work && buckets.work.length)) && (
        <Section title="Personnel & Work Progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Workers on site" value={any(form?.numWorkers)} />
            <Line label="Attendance" value={any(form?.workerAttendance)} />
            <Line label="Schedule" value={any(form?.scheduleCompliance)} />
            <Line label="Materials" value={any(form?.materialAvailability)} />
            <Line label="Progress" value={any(form?.workProgress)} />
          </div>
          <div className="mt-4">
            <PhotoGrid photos={buckets.work || []} />
          </div>
        </Section>
      )}

      {/* Equipment & Quality */}
      {(any(form?.equipmentCondition) ||
        any(form?.maintenanceStatus) ||
        any(form?.workmanshipQuality) ||
        any(form?.specificationCompliance) ||
        (buckets.equipment && buckets.equipment.length) ||
        (buckets.quality && buckets.quality.length)) && (
        <Section title="Equipment & Quality">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Equipment Condition" value={any(form?.equipmentCondition)} />
            <Line label="Maintenance" value={any(form?.maintenanceStatus)} />
            <Line label="Workmanship" value={any(form?.workmanshipQuality)} />
            <Line label="Per Specs" value={any(form?.specificationCompliance)} />
          </div>
          <div className="mt-4">
            <PhotoGrid photos={[...(buckets.equipment || []), ...(buckets.quality || [])]} />
          </div>
        </Section>
      )}

      {/* Incidents & Site */}
      {(any(form?.incidentsHazards) || any(form?.siteHousekeeping) || any(form?.stakeholderVisits) || (buckets.incidents && buckets.incidents.length)) && (
        <Section title="Incidents & Site Conditions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Line label="Incidents / Hazards" value={any(form?.incidentsHazards)} />
            <Line label="Housekeeping" value={any(form?.siteHousekeeping)} />
            <Line label="Stakeholder Visits" value={any(form?.stakeholderVisits)} />
          </div>
          <div className="mt-4">
            <PhotoGrid photos={buckets.incidents || []} />
          </div>
        </Section>
      )}

      {/* Notes */}
      {(any(form?.additionalComments) || any(form?.inspectorSummary) || any(form?.recommendations) || (buckets.notes && buckets.notes.length)) && (
        <Section title="Notes & Summary">
          <div className="space-y-2">
            <Line label="Comments" value={any(form?.additionalComments)} />
            <Line label="Inspector's Summary" value={any(form?.inspectorSummary)} />
            <Line label="Recommendations" value={any(form?.recommendations)} />
          </div>
          <div className="mt-4">
            <PhotoGrid photos={buckets.notes || []} />
          </div>
        </Section>
      )}

      {/* Photo Evidence */}
      {buckets.evidence?.length ? (
        <Section title="Photo Evidence">
          <PhotoGrid photos={buckets.evidence} />
        </Section>
      ) : null}

      {/* Additional Images */}
      {buckets.additional?.length ? (
        <Section title="Additional Images">
          <PhotoGrid photos={buckets.additional} />
        </Section>
      ) : null}

      {/* Signature preview */}
      {signatureData ? (
        <Section title="Signature">
          <div className="signature-pad p-4 rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureData} alt="signature" className="max-h-32 object-contain" />
            <div className="text-sm text-kiwi-gray mt-2">
              Signed on: {form?.signatureDateTime || "—"}
            </div>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
