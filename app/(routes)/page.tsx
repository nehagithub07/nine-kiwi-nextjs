/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import ProgressBar from "@/components/ProgressBar";
import WeatherPanel from "@/components/WeatherPanel";
import FlexibleAnswer from "@/components/FlexibleAnswer";
import SectionPhotos from "@/components/SectionPhotos";
import ReportPreview from "@/components/ReportPreview";
import AutoSummary from "@/components/AutoSummary";
import SignaturePadBox from "@/components/SignaturePad";
import MapCard from "@/components/MapCard";

import { generateFullReportPDF } from "@/lib/export";

// ✅ local UI photo type
import { UPhoto } from "@/lib/types";

/* ------------ Types that match the exporter (do not change names) ------------ */
type FlexMode = "yesno" | "text";
type FlexFieldId =
  | "weatherConditions"
  | "safetyCompliance"
  | "safetySignage"
  | "equipmentCondition"
  | "workmanshipQuality"
  | "siteHousekeeping"
  | "communicationRating";

export type PhotoData = {
  name: string;
  data: string; // dataURL or http(s)
  includeInSummary?: boolean;
  caption?: string;
  figureNumber?: number;
  description?: string;
};

type FormData = {
  reportId: string;

  /** Company info */
  nameandAddressOfCompany: string;
  companyName: string;

  /** Meta */
  observationTime?: string;
  reportDate?: string;
  preparedFor?: string;
  preparedBy?: string;

  status: "In Progress" | "Completed" | "On Track" | "";
  clientName: string;
  inspectorName: string;
  contactPhone: string;
  contactEmail: string;

  /** Location details */
  location: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;

  /** Coordinates for map rendering */
  lat: string;
  lon: string;

  inspectionDate: string;
  startInspectionTime: string;

  /** Weather snapshot */
  temperature: string;
  humidity: string;
  windSpeed: string;
  weatherDescription: string;

  /** flexible answers (yes/no or text) */
  weatherConditions: string;
  safetyCompliance: string;
  safetySignage: string;
  equipmentCondition: string;
  workmanshipQuality: string;
  siteHousekeeping: string;
  communicationRating: string;

  /** other radios/texts */
  numWorkers: string;
  workerAttendance: string;
  workProgress: string;
  scheduleCompliance: string;
  materialAvailability: string;
  maintenanceStatus: string;
  specificationCompliance: string;
  incidentsHazards: string;
  stakeholderVisits: string;

  /** notes */
  additionalComments: string;
  inspectorSummary: string;
  recommendations: string;
  recommendationRating: string;
  improvementAreas: string;
  signatureDateTime: string;

  /** detail notes shown when a related yes/no is "Yes" */
  weatherConditionsNote?: string;
  safetyComplianceNote?: string;
  safetySignageNote?: string;
  equipmentConditionNote?: string;
  workmanshipQualityNote?: string;
  siteHousekeepingNote?: string;
  communicationRatingNote?: string;

  /** per-field mode */
  flexibleModes: Record<FlexFieldId, FlexMode>;

  /** NEW: Background + Field Observation text */
  backgroundManual: string;       // user's own background text
  backgroundAuto: string;         // auto generated from inputs
  fieldObservationText: string;   // user's own field observation text
};

const S = (v: unknown) => (v == null ? "" : String(v).trim());

export default function Page() {
  /* ---------------- State ---------------- */
  const [form, setForm] = useState<FormData>(() => ({
    status: "",
    reportId: "",

    clientName: "",
    companyName: "",
    inspectorName: "",
    nameandAddressOfCompany: "",
    contactPhone: "",
    contactEmail: "",

    location: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",

    lat: "",
    lon: "",

    inspectionDate: "",
    startInspectionTime: "",

    temperature: "",
    humidity: "",
    windSpeed: "",
    weatherDescription: "",

    weatherConditions: "",
    safetyCompliance: "",
    safetySignage: "",
    equipmentCondition: "",
    workmanshipQuality: "",
    siteHousekeeping: "",
    communicationRating: "",

    numWorkers: "",
    workerAttendance: "",
    workProgress: "",
    scheduleCompliance: "",
    materialAvailability: "",
    maintenanceStatus: "",
    specificationCompliance: "",
    incidentsHazards: "",
    stakeholderVisits: "",

    additionalComments: "",
    inspectorSummary: "",
    recommendations: "",
    recommendationRating: "",
    improvementAreas: "",
    signatureDateTime: "",

    weatherConditionsNote: "",
    safetyComplianceNote: "",
    safetySignageNote: "",
    equipmentConditionNote: "",
    workmanshipQualityNote: "",
    siteHousekeepingNote: "",
    communicationRatingNote: "",

    flexibleModes: {
      weatherConditions: "yesno",
      safetyCompliance: "yesno",
      safetySignage: "yesno",
      equipmentCondition: "yesno",
      workmanshipQuality: "yesno",
      siteHousekeeping: "yesno",
      communicationRating: "yesno",
    },

    // NEW fields
    backgroundManual: "",
    backgroundAuto: "",
    fieldObservationText: "",
  }));

  // per-section photos (your UI type)
  const [sectionPhotos, setSectionPhotos] = useState<Record<string, UPhoto[]>>({
    weather: [],
    safety: [],
    work: [],
    equipment: [],
    incidents: [],
    quality: [],
    notes: [],
    evidence: [],
    additional: [],
    // NEW buckets
    background: [],
    fieldObservation: [],
  });

  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Initialize dates and fetch geolocated weather
  useEffect(() => {
    const now = new Date();
    setForm((f) => ({
      ...f,
      inspectionDate: f.inspectionDate || now.toISOString().split("T")[0],
      startInspectionTime: f.startInspectionTime || "12:00",
      signatureDateTime: f.signatureDateTime || now.toISOString().slice(0, 16),
    }));

    const fetchWeatherData = async () => {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) return;

          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

          try {
            const response = await fetch(url);
            const data: any = await response.json();

            setForm((prev) => ({
              ...prev,
              temperature: String(Math.round(data?.main?.temp ?? 0)),
              humidity: String(Math.round(data?.main?.humidity ?? 0)),
              windSpeed: String(Math.round(data?.wind?.speed ?? 0)),
              weatherDescription: data?.weather?.[0]?.main ?? "",
              lat: String(latitude),
              lon: String(longitude),
            }));
          } catch (error) {
            console.error("Error fetching weather data:", error);
          }
        });
      }
    };

    fetchWeatherData();
  }, []);

  /* ---------------- Helpers ---------------- */

  // Map UPhoto -> PhotoData for the exporter (keeps caption/description)
  const adaptPhotos = (arr: UPhoto[]): PhotoData[] =>
    (arr || []).map((p: any) => ({
      name: p.name ?? p.filename ?? "Photo",
      data: p.data ?? p.src ?? "",
      includeInSummary: !!p.includeInSummary,
      caption: p.caption ?? p.name ?? "",
      description: p.description ?? "",
      figureNumber: p.figureNumber,
    }));

  // Build a Record<string, PhotoData[]> on demand for full report export
  const adaptedSectionPhotos = useMemo(() => {
    const out: Record<string, PhotoData[]> = {};
    for (const key of Object.keys(sectionPhotos)) {
      out[key] = adaptPhotos(sectionPhotos[key] || []);
    }
    return out;
  }, [sectionPhotos]);

  // Summary photos (for AutoSummary preview only)
  const summaryPhotosU = useMemo(() => {
    const all = sectionPhotos.evidence || [];
    const selected = all.filter((p: any) => (p as any)?.includeInSummary);
    return selected.length ? selected : all;
  }, [sectionPhotos.evidence]);

  /* ---------------- Derived ---------------- */
  const filledPercent = useMemo(() => {
    const ids = [
      "status",
      "reportId",
      "inspectorName",
      "location",
      "inspectionDate",
      "temperature",
      "humidity",
      "windSpeed",
      "weatherDescription",
      "weatherConditions",
      "safetyCompliance",
      "safetySignage",
      "numWorkers",
      "workerAttendance",
      "workProgress",
      "scheduleCompliance",
      "materialAvailability",
      "equipmentCondition",
      "maintenanceStatus",
      "workmanshipQuality",
      "specificationCompliance",
      "incidentsHazards",
      "siteHousekeeping",
      "stakeholderVisits",
      "additionalComments",
      "inspectorSummary",
      "recommendations",
      "communicationRating",
      "recommendationRating",
      "improvementAreas",
      "signatureDateTime",
      "clientName",
      "companyName",
      "contactPhone",
      "contactEmail",
      "streetAddress",
      "city",
      "country",
      "zipCode",
      "startInspectionTime",
    ] as (keyof FormData)[];

    let filled = 0;
    ids.forEach((k) => {
      const v = form[k];
      if (typeof v === "string" && v.trim() !== "") filled++;
    });
    return Math.round((filled / ids.length) * 100);
  }, [form]);

  const setPhotoBucket =
    (key: keyof typeof sectionPhotos) =>
    (p: UPhoto[]) =>
      setSectionPhotos((sp) => ({ ...sp, [key]: p }));

  // ✅ tighten typing to keys only (prevents accidental typos)
  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateFlex = (id: FlexFieldId, mode: FlexMode, value: string) =>
    setForm((f) => ({
      ...f,
      [id]: value,
      flexibleModes: { ...f.flexibleModes, [id]: mode },
    }));

  // Build auto background (simple, mirrors export.ts logic)
  const makeAutoBackground = () => {
    const parts: string[] = [];
    const address =
      [form.streetAddress, [form.city, form.state].filter(Boolean).join(", "), [form.country, form.zipCode].filter(Boolean).join(" ")]
        .filter(Boolean)
        .map(S)
        .filter(Boolean)
        .join(", ") || S(form.location);

    if (address) parts.push(`The property located at ${address} was reviewed for current construction progress and site safety conditions.`);
    if (S(form.workProgress)) parts.push(`Observed work: ${S(form.workProgress)}.`);
    if (S(form.scheduleCompliance)) parts.push(`Schedule position: ${S(form.scheduleCompliance)}.`);
    if (S(form.materialAvailability)) parts.push(`Materials: ${S(form.materialAvailability)}.`);
    if (S(form.safetyCompliance)) parts.push(`Safety compliance: ${S(form.safetyCompliance)}.`);
    if (S(form.safetySignage)) parts.push(`Safety signage and access control: ${S(form.safetySignage)}.`);

    if (!parts.length) {
      parts.push("This section summarizes project background based on inspector inputs and photographic evidence collected during the visit.");
    }
    updateField("backgroundAuto", parts.join(" "));
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-kiwi-green/20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center">
                <Image src="/logo.png" alt="nineKiwi_logo" width={40} height={40} />
              </div>
              <h1 className="text-2xl font-heading font-bold text-kiwi-dark">
                nine<span className="text-kiwi-green">kiwi</span> Report Generator
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: FORM */}
          <section className="space-y-6">
            <ProgressBar percent={filledPercent} />

            {/* Status */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Field Condition Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status radio */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Status</label>
                  <div className="flex gap-6">
                    {(["In Progress", "Completed", "On Track"] as const).map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          value={v}
                          checked={form.status === v}
                          onChange={(e) => updateField("status", e.target.value as FormData["status"])}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Report ID */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="reportId">
                    Report ID
                  </label>
                  <input
                    id="reportId"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="1234"
                    value={form.reportId}
                    onChange={(e) => updateField("reportId", e.target.value)}
                  />
                </div>

                {/* Inspector */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="inspectorName">
                    Name of Filed Inspector
                  </label>
                  <input
                    id="inspectorName"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Inspector name"
                    value={form.inspectorName}
                    onChange={(e) => updateField("inspectorName", e.target.value)}
                  />
                </div>

                {/* Company */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2" htmlFor="nameandAddressOfCompany">
                    Name and Address of Inspection Company
                  </label>
                  <input
                    id="nameandAddressOfCompany"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Company name and full address"
                    value={form.nameandAddressOfCompany}
                    onChange={(e) => updateField("nameandAddressOfCompany", e.target.value)}
                  />
                </div>

                {/* Client/Owner */}
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="clientName">
                    Client / Owner NAME
                  </label>
                  <input
                    id="clientName"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Owner name"
                    value={form.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="companyName">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Enter company name"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="contactPhone">
                    Phone Number of Inspection Company
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="+1 555 000 000"
                    value={form.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="contactEmail">
                    Email of Inspection Company
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="name@gmail.com"
                    value={form.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="inspectionDate">
                    Date of Inspection
                  </label>
                  <input
                    id="inspectionDate"
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.inspectionDate}
                    onChange={(e) => updateField("inspectionDate", e.target.value)}
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm mb-2" htmlFor="observationTime">
                    Start Time of Inspection
                  </label>
                  <input
                    id="observationTime"
                    type="time"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.startInspectionTime}
                    onChange={(e) => updateField("startInspectionTime", e.target.value)}
                  />
                  <span className="text-xs text-gray-500 mt-1 block">
                    {form.startInspectionTime &&
                      ` (${new Date(`2000-01-01T${form.startInspectionTime}`).toLocaleTimeString(
                        "en-US",
                        { hour: "numeric", minute: "2-digit", hour12: true }
                      )})`}
                  </span>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2" htmlFor="location">
                    Inspection Property Address
                  </label>
                  <input
                    id="location"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Ambedkar Nagar Gali No. 4, Jwalapur, Haridwar"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Haridwar"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Uttarakhand"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="India"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="zipCode">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="249407"
                    value={form.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Weather */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Weather Conditions</h2>

              <WeatherPanel
                form={form}
                onField={updateField}
                onFetched={(w) => {
                  updateField("temperature", String(w.temperature));
                  updateField("humidity", String(w.humidity));
                  updateField("windSpeed", String(w.windSpeed));
                  updateField("weatherDescription", w.description as string);
                }}
              />

              {/* Address → Coords helper */}
              <MapCard
                className="mt-4"
                address={
                  [form.streetAddress, form.city, form.state, form.country, form.zipCode]
                    .filter(Boolean)
                    .join(", ") || form.location
                }
                onCoords={(lat, lon) => {
                  updateField("lat", String(lat));
                  updateField("lon", String(lon));

                  // Weather by chosen coordinates and inspection time
                  const fetchWeather = async () => {
                    const d = form.inspectionDate
                      ? new Date(`${form.inspectionDate}T${form.startInspectionTime || "12:00"}`)
                      : new Date();
                    const isoDate = d.toISOString().split("T")[0];

                    try {
                      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m&timezone=auto&start_date=${isoDate}&end_date=${isoDate}`;
                      const resp = await fetch(url);
                      const json: any = await resp.json();

                      const cw = json?.current_weather;
                      let temperature: any = cw?.temperature ?? "";
                      let wind: any = cw?.windspeed ?? "";

                      const hours: string[] = json?.hourly?.time || [];
                      const temps: number[] = json?.hourly?.temperature_2m || [];
                      const hums: number[] = json?.hourly?.relative_humidity_2m || [];
                      const winds: number[] = json?.hourly?.windspeed_10m || [];

                      if (hours?.length) {
                        const target = d.getTime();
                        let best = 0;
                        let bestDiff = Number.POSITIVE_INFINITY;

                        for (let i = 0; i < hours.length; i++) {
                          const t = new Date(hours[i]).getTime();
                          const diff = Math.abs(t - target);
                          if (diff < bestDiff) {
                            best = i;
                            bestDiff = diff;
                          }
                        }

                        if (temps?.[best] != null) temperature = temps[best];
                        if (winds?.[best] != null) wind = winds[best];
                        const humidity = hums?.[best] ?? "";

                        updateField("temperature", String(Math.round(Number(temperature))));
                        updateField("humidity", String(Math.round(Number(humidity))));
                        updateField("windSpeed", String(Math.round(Number(wind))));

                        if (!form.weatherDescription) {
                          const tnum = Number(temperature);
                          const desc = isNaN(tnum)
                            ? "—"
                            : tnum <= 0
                            ? "Freezing"
                            : tnum < 10
                            ? "Cold"
                            : tnum < 20
                            ? "Mild"
                            : tnum < 30
                            ? "Warm"
                            : "Hot";
                          updateField("weatherDescription", desc);
                        }
                      }
                    } catch (error) {
                      console.error("Error fetching weather:", error);
                    }
                  };
                  fetchWeather();
                }}
              />

              <div className="mt-4">
                <FlexibleAnswer
                  id="weatherConditions"
                  label="Any Weather Interruption"
                  value={form.weatherConditions}
                  onChange={(m, v) => updateFlex("weatherConditions", m, v)}
                  noteValue={form.weatherConditionsNote}
                  onNoteChange={(t) => updateField("weatherConditionsNote", t)}
                />
              </div>
            </div>

            {/* NEW: Background */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Background</h2>

              <label className="block text-sm mb-2" htmlFor="backgroundManual">
                Background (optional free text)
              </label>
              <textarea
                id="backgroundManual"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                placeholder="Add any project context, scope, prior inspections, approvals, etc."
                value={form.backgroundManual}
                onChange={(e) => updateField("backgroundManual", e.target.value)}
              />

              <div className="mt-3 flex gap-3">
                <button
                  onClick={makeAutoBackground}
                  className="bg-kiwi-green hover:bg-kiwi-dark text-white font-semibold py-2 px-4 rounded-lg transition"
                  type="button"
                >
                  Auto-generate Background
                </button>
                <input
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                  value={form.backgroundAuto}
                  placeholder="Auto background will appear here"
                />
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Background Photos (optional)"
                  photos={sectionPhotos.background}
                  setPhotos={setPhotoBucket("background")}
                />
              </div>
            </div>

            {/* Safety */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Safety & Compliance</h2>
              <div className="space-y-4">
                <FlexibleAnswer
                  id="safetyCompliance"
                  label="All safety protocols & PPE followed?"
                  value={form.safetyCompliance}
                  onChange={(m, v) => updateFlex("safetyCompliance", m, v)}
                  noteValue={form.safetyComplianceNote}
                  onNoteChange={(t) => updateField("safetyComplianceNote", t)}
                />
                <FlexibleAnswer
                  id="safetySignage"
                  label="Safety signage & access control in place?"
                  value={form.safetySignage}
                  onChange={(m, v) => updateFlex("safetySignage", m, v)}
                  noteValue={form.safetySignageNote}
                  onNoteChange={(t) => updateField("safetySignageNote", t)}
                />
              </div>
            </div>

            {/* Personnel & Work */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">
                Personnel & Work Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">All workers present & on time?</label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="workerAttendance"
                          value={v}
                          checked={form.workerAttendance === v}
                          onChange={(e) => updateField("workerAttendance", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Progress vs schedule</label>
                  <div className="flex gap-4">
                    {["Ahead", "On Track", "Behind"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="scheduleCompliance"
                          value={v}
                          checked={form.scheduleCompliance === v}
                          onChange={(e) => updateField("scheduleCompliance", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Materials available & usable?</label>
                  <div className="flex gap-4">
                    {["Yes", "Partial", "No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="materialAvailability"
                          value={v}
                          checked={form.materialAvailability === v}
                          onChange={(e) => updateField("materialAvailability", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Inspection / Construction Progress"
                  photos={sectionPhotos.work}
                  setPhotos={setPhotoBucket("work")}
                />
              </div>
            </div>

            {/* NEW: Field Observation (text + images) */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Field Observation</h2>

              <label className="block text-sm mb-2" htmlFor="fieldObservationText">
                Field Observation (optional free text)
              </label>
              <textarea
                id="fieldObservationText"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                placeholder="Summarize key on-site observations, hazards, deviations, or noteworthy progress."
                value={form.fieldObservationText}
                onChange={(e) => updateField("fieldObservationText", e.target.value)}
              />

              <div className="mt-4">
                <SectionPhotos
                  title="Field Observation Photos"
                  photos={sectionPhotos.fieldObservation}
                  setPhotos={setPhotoBucket("fieldObservation")}
                />
              </div>
            </div>

            {/* Equipment & Quality */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">
                Inspection Support Equipment (if any)
              </h2>

              <div className="mt-4">
                <SectionPhotos
                  title="Overall Field Condition Photo, Including Equipment"
                  photos={sectionPhotos.equipment}
                  setPhotos={setPhotoBucket("equipment")}
                />
              </div>
            </div>

            {/* Notes & Summary */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">
                Additional Inspection Notes (if any)
              </h2>
              <div className="space-y-4">
                {(
                  [
                    ["additionalComments", "Additional comments / observations", ""],
                    ["inspectorSummary", "Inspector's Summary (short)", "1–3 concise bullet points…"],
                    ["recommendations", "Recommendations / next actions", ""],
                  ] as const
                ).map(([id, label, ph]) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" htmlFor={id}>
                      {label}
                    </label>
                    <textarea
                      id={id}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                      placeholder={ph}
                      value={form[id as keyof FormData] as string}
                      onChange={(e) => updateField(id as keyof FormData, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Images */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">
                Additional Images (optional)
              </h2>
              <SectionPhotos
                title="Additional Images"
                photos={sectionPhotos.additional}
                setPhotos={setPhotoBucket("additional")}
              />
            </div>

            <SignaturePadBox
              signatureData={signatureData}
              setSignatureData={setSignatureData}
              value={form.signatureDateTime}
              onDate={(v) => updateField("signatureDateTime", v)}
              signer={form.inspectorName}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button
                onClick={() =>
                  generateFullReportPDF(
                    form as any,
                    adaptedSectionPhotos as any,
                    signatureData
                  )
                }
                className="flex-1 bg-kiwi-green hover:bg-kiwi-dark text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                Generate PDF Report
              </button>
            </div>
          </section>

          {/* RIGHT: PREVIEW + AUTO SUMMARY */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Live Preview</h2>

              <ReportPreview
                form={form}
                sectionPhotos={sectionPhotos}
                signatureData={signatureData}
              />

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-kiwi-dark mb-3">
                  Auto-Generated Summary
                </h3>
                <AutoSummary form={form} photos={summaryPhotosU} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
