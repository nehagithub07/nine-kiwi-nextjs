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

import { generateFullReportPDF, generateSummaryPDF, generateSummaryWord } from "@/lib/export";
import { UPhoto } from "../lib/types";

/* ---------------- Types ---------------- */
type FlexMode = "yesno" | "text";
type FlexFieldId =
  | "weatherConditions" | "safetyCompliance" | "safetySignage"
  | "equipmentCondition" | "workmanshipQuality" | "siteHousekeeping"
  | "qualityRating" | "communicationRating";

type FormData = {
  projectName: string; reportId: string; clientName: string; contractorName: string;
  inspectorName: string; supervisorName: string; contactPhone: string; contactEmail: string;
  location: string; inspectionDate: string;
  weatherTime: string; // NEW: observation time (HH:MM)

  temperature: string; humidity: string; windSpeed: string; weatherDescription: string;

  // flexible answers now are yes/no or free text (all string)
  weatherConditions: string;
  safetyCompliance: string; safetySignage: string;
  equipmentCondition: string; workmanshipQuality: string;
  siteHousekeeping: string;
  qualityRating: string; communicationRating: string;

  // other radios/texts
  numWorkers: string; workerAttendance: string;
  workProgress: string; scheduleCompliance: string; materialAvailability: string;
  maintenanceStatus: string; specificationCompliance: string;
  incidentsHazards: string; stakeholderVisits: string;

  // notes
  additionalComments: string; inspectorSummary: string; recommendations: string;
  recommendationRating: string; improvementAreas: string;
  signatureDateTime: string;

  // per-field mode
  flexibleModes: Record<FlexFieldId, FlexMode>;
};

export default function Page() {
  /* ---------------- State ---------------- */
  const [form, setForm] = useState<FormData>(() => ({
    projectName: "", reportId: "", clientName: "", contractorName: "",
    inspectorName: "", supervisorName: "", contactPhone: "", contactEmail: "",
    location: "", inspectionDate: "", weatherTime: "",

    temperature: "", humidity: "", windSpeed: "", weatherDescription: "",

    weatherConditions: "",
    safetyCompliance: "", safetySignage: "",
    equipmentCondition: "", workmanshipQuality: "",
    siteHousekeeping: "",
    qualityRating: "", communicationRating: "",

    numWorkers: "", workerAttendance: "",
    workProgress: "", scheduleCompliance: "", materialAvailability: "",
    maintenanceStatus: "", specificationCompliance: "",
    incidentsHazards: "", stakeholderVisits: "",

    additionalComments: "", inspectorSummary: "", recommendations: "",
    recommendationRating: "", improvementAreas: "",
    signatureDateTime: "",

    flexibleModes: {
      weatherConditions: "yesno",
      safetyCompliance: "yesno",
      safetySignage: "yesno",
      equipmentCondition: "yesno",
      workmanshipQuality: "yesno",
      siteHousekeeping: "yesno",
      qualityRating: "text",           // free-text overall feedback
      communicationRating: "yesno",
    },
  }));

  // per-section photos (with captions)
  const [sectionPhotos, setSectionPhotos] = useState<Record<string, UPhoto[]>>({
    weather: [],
    safety: [],
    work: [],
    equipment: [],
    incidents: [],
    quality: [],
    notes: [],
    evidence: [], // main Photo Evidence section
  });

  const [signatureData, setSignatureData] = useState<string | null>(null);

  // init dates
  useEffect(() => {
    const now = new Date();
    setForm((f) => ({
      ...f,
      inspectionDate: f.inspectionDate || now.toISOString().split("T")[0],
      weatherTime: f.weatherTime || "12:00",
      signatureDateTime: f.signatureDateTime || now.toISOString().slice(0, 16),
    }));
  }, []);

  /* ---------------- Derived ---------------- */
  const filledPercent = useMemo(() => {
    const ids = [
      "projectName","inspectorName","location","inspectionDate",
      "temperature","humidity","windSpeed","weatherDescription","weatherConditions",
      "safetyCompliance","safetySignage","numWorkers","workerAttendance",
      "workProgress","scheduleCompliance","materialAvailability",
      "equipmentCondition","maintenanceStatus","workmanshipQuality",
      "specificationCompliance","incidentsHazards","siteHousekeeping","stakeholderVisits",
      "additionalComments","inspectorSummary","recommendations","qualityRating","communicationRating",
      "recommendationRating","improvementAreas","signatureDateTime","clientName","contractorName","supervisorName","contactPhone","contactEmail","reportId",
      "weatherTime",
    ] as (keyof FormData)[];

    let filled = 0;
    ids.forEach((k) => {
      const v = form[k];
      if (typeof v === "string" && v.trim() !== "") filled++;
    });
    return Math.round((filled / ids.length) * 100);
  }, [form]);

  const setPhotoBucket = (key: keyof typeof sectionPhotos) => (p: UPhoto[]) =>
    setSectionPhotos((sp) => ({ ...sp, [key]: p }));

  const updateField = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateFlex = (id: FlexFieldId, mode: FlexMode, value: string) =>
    setForm((f) => ({ ...f, [id]: value, flexibleModes: { ...f.flexibleModes, [id]: mode } }));

  // Summary photos: choose checked from Evidence, else all Evidence
  const summaryPhotos = useMemo(() => {
    const all = sectionPhotos.evidence;
    const selected = all.filter((p) => p.includeInSummary);
    return selected.length ? selected : all;
  }, [sectionPhotos.evidence]);

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

            {/* Project & Contact */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Project & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ["projectName","Project Name","Eg. Tower A Footings"],
                  ["reportId","Report ID","Auto/Manual"],
                  ["clientName","Client / Owner","Client name"],
                  ["contractorName","Contractor","Contractor"],
                  ["inspectorName","Inspector","Inspector name"],
                  ["supervisorName","Site Supervisor","Supervisor name"],
                  ["contactPhone","Phone","+1 555 000 000"],
                  ["contactEmail","Email","name@company.com"],
                  ["location","Location","Site address"],
                ] as const).map(([id,label,ph]) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                      placeholder={ph}
                      value={form[id as keyof FormData] as string}
                      onChange={(e) => updateField(id as keyof FormData, e.target.value)}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm mb-2" htmlFor="inspectionDate">Date</label>
                  <input
                    id="inspectionDate" type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.inspectionDate}
                    onChange={(e) => updateField("inspectionDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="weatherTime">Weather Observation Time</label>
                  <input
                    id="weatherTime" type="time"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.weatherTime}
                    onChange={(e) => updateField("weatherTime", e.target.value)}
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
                  updateField("weatherDescription", w.description);
                }}
              />

              <div className="mt-4">
                <FlexibleAnswer
                  id="weatherConditions"
                  label="Weather impact today"
                  mode={form.flexibleModes.weatherConditions}
                  value={form.weatherConditions}
                  onChange={(m, v) => updateFlex("weatherConditions", m, v)}
                />
              </div>

              {/* Live map + auto weather from coords */}
              <MapCard
                className="mt-4"
                address={form.location}
                onCoords={(lat, lon) => {
                  const fetchWeather = async () => {
                    const d = form.inspectionDate
                      ? new Date(`${form.inspectionDate}T${form.weatherTime || "12:00"}`)
                      : new Date();
                    const isoDate = d.toISOString().split("T")[0];
                    try {
                      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m&timezone=auto&start_date=${isoDate}&end_date=${isoDate}`;
                      const resp = await fetch(url);
                      const json = await resp.json();

                      const cw = json?.current_weather;
                      let temperature: any = cw?.temperature ?? "";
                      let wind: any = cw?.windspeed ?? "";

                      const hours: string[] = json?.hourly?.time || [];
                      const temps: number[] = json?.hourly?.temperature_2m || [];
                      const hums: number[] = json?.hourly?.relative_humidity_2m || [];
                      const winds: number[] = json?.hourly?.windspeed_10m || [];

                      if (hours?.length) {
                        const target = d.getTime();
                        let best = 0, bestDiff = Number.POSITIVE_INFINITY;
                        for (let i=0;i<hours.length;i++){
                          const t = new Date(hours[i]).getTime();
                          const diff = Math.abs(t - target);
                          if (diff < bestDiff) { best = i; bestDiff = diff; }
                        }
                        if (temps?.[best] != null) temperature = temps[best];
                        if (winds?.[best] != null) wind = winds[best];
                        const humidity = hums?.[best] ?? "";
                        updateField("temperature", String(Math.round(Number(temperature))));
                        updateField("humidity", String(Math.round(Number(humidity))));
                        updateField("windSpeed", String(Math.round(Number(wind))));
                        if (!form.weatherDescription) {
                          const tnum = Number(temperature);
                          const desc = isNaN(tnum) ? "—"
                            : tnum <= 0 ? "Freezing"
                            : tnum < 10 ? "Cold"
                            : tnum < 20 ? "Mild"
                            : tnum < 30 ? "Warm" : "Hot";
                          updateField("weatherDescription", desc);
                        }
                      }
                    } catch {/* ignore */}
                  };
                  fetchWeather();
                }}
              />

              {/* Section photos */}
              <div className="mt-4">
                <SectionPhotos
                  title="Weather Photos"
                  photos={sectionPhotos.weather}
                  setPhotos={setPhotoBucket("weather")}
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
                  mode={form.flexibleModes.safetyCompliance}
                  value={form.safetyCompliance}
                  onChange={(m, v) => updateFlex("safetyCompliance", m, v)}
                />
                <FlexibleAnswer
                  id="safetySignage"
                  label="Safety signage & access control in place?"
                  mode={form.flexibleModes.safetySignage}
                  value={form.safetySignage}
                  onChange={(m, v) => updateFlex("safetySignage", m, v)}
                />
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Safety Photos"
                  photos={sectionPhotos.safety}
                  setPhotos={setPhotoBucket("safety")}
                />
              </div>
            </div>

            {/* Personnel & Work */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Personnel & Work Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" htmlFor="numWorkers">Workers on site</label>
                  <input
                    id="numWorkers" type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.numWorkers}
                    onChange={(e) => updateField("numWorkers", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">All workers present & on time?</label>
                  <div className="flex gap-4">
                    {["Yes","No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="workerAttendance" value={v}
                          checked={form.workerAttendance === v}
                          onChange={(e) => updateField("workerAttendance", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2" htmlFor="workProgress">Current work progress summary</label>
                  <textarea
                    id="workProgress" rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Key activities, trades, locations…"
                    value={form.workProgress}
                    onChange={(e) => updateField("workProgress", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Progress vs schedule</label>
                  <div className="flex gap-4">
                    {["Ahead","On Track","Behind"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="scheduleCompliance" value={v}
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
                    {["Yes","Partial","No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="materialAvailability" value={v}
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
                  title="Work Progress Photos"
                  photos={sectionPhotos.work}
                  setPhotos={setPhotoBucket("work")}
                />
              </div>
            </div>

            {/* Equipment & Quality */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Equipment & Quality</h2>

              <FlexibleAnswer
                id="equipmentCondition"
                label="Condition of tools/equipment/machinery"
                mode={form.flexibleModes.equipmentCondition}
                value={form.equipmentCondition}
                onChange={(m, v) => updateFlex("equipmentCondition", m, v)}
              />

              <div className="mt-3">
                <label className="block text-sm mb-2">Equipment maintenance up to date?</label>
                <div className="flex gap-4">
                  {["Yes","Partial","No"].map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio" name="maintenanceStatus" value={v}
                        checked={form.maintenanceStatus === v}
                        onChange={(e) => updateField("maintenanceStatus", e.target.value)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <FlexibleAnswer
                  id="workmanshipQuality"
                  label="Quality of workmanship"
                  mode={form.flexibleModes.workmanshipQuality}
                  value={form.workmanshipQuality}
                  onChange={(m, v) => updateFlex("workmanshipQuality", m, v)}
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm mb-2">Work per specs?</label>
                <div className="flex gap-4">
                  {["Yes","Mostly","No"].map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio" name="specificationCompliance" value={v}
                        checked={form.specificationCompliance === v}
                        onChange={(e) => updateField("specificationCompliance", e.target.value)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Equipment & Quality Photos"
                  photos={sectionPhotos.equipment}
                  setPhotos={setPhotoBucket("equipment")}
                />
              </div>
            </div>

            {/* Incidents & Site */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Incidents & Site Conditions</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Any incidents, near misses, or hazards today?</label>
                  <div className="flex gap-4">
                    {["Yes","No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="incidentsHazards" value={v}
                          checked={form.incidentsHazards === v}
                          onChange={(e) => updateField("incidentsHazards", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <FlexibleAnswer
                  id="siteHousekeeping"
                  label="Housekeeping / cleanliness / waste mgmt"
                  mode={form.flexibleModes.siteHousekeeping}
                  value={form.siteHousekeeping}
                  onChange={(m, v) => updateFlex("siteHousekeeping", m, v)}
                />

                <div>
                  <label className="block text-sm mb-2">Any stakeholder/inspector visits?</label>
                  <div className="flex gap-4">
                    {["Yes","No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="stakeholderVisits" value={v}
                          checked={form.stakeholderVisits === v}
                          onChange={(e) => updateField("stakeholderVisits", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Incidents & Site Photos"
                  photos={sectionPhotos.incidents}
                  setPhotos={setPhotoBucket("incidents")}
                />
              </div>
            </div>

            {/* Notes & Summary */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Notes & Summary</h2>
              <div className="space-y-4">
                {([
                  ["additionalComments", "Additional comments / observations", ""],
                  ["inspectorSummary", "Inspector's Summary (short)", "1–3 concise bullet points…"],
                  ["recommendations", "Recommendations / next actions", ""],
                ] as const).map(([id, label, ph]) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" htmlFor={id}>{label}</label>
                    <textarea
                      id={id} rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                      placeholder={ph}
                      value={form[id as keyof FormData] as string}
                      onChange={(e) => updateField(id as keyof FormData, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Notes Photos"
                  photos={sectionPhotos.notes}
                  setPhotos={setPhotoBucket("notes")}
                />
              </div>
            </div>

            {/* Quality Survey */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Quality Survey</h2>
              <div className="space-y-4">
                <FlexibleAnswer
                  id="qualityRating"
                  label="Overall project quality"
                  mode={form.flexibleModes.qualityRating}
                  value={form.qualityRating}
                  onChange={(m, v) => updateFlex("qualityRating", m, v)}
                />
                <FlexibleAnswer
                  id="communicationRating"
                  label="Team communication"
                  mode={form.flexibleModes.communicationRating}
                  value={form.communicationRating}
                  onChange={(m, v) => updateFlex("communicationRating", m, v)}
                />
                <div>
                  <label className="block text-sm mb-2">Recommend contractor/team for future?</label>
                  <div className="flex gap-4">
                    {["Yes","Maybe","No"].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio" name="recommendationRating" value={v}
                          checked={form.recommendationRating === v}
                          onChange={(e) => updateField("recommendationRating", e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" htmlFor="improvementAreas">Areas for improvement</label>
                  <textarea
                    id="improvementAreas" rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.improvementAreas}
                    onChange={(e) => updateField("improvementAreas", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <SectionPhotos
                  title="Quality Photos"
                  photos={sectionPhotos.quality}
                  setPhotos={setPhotoBucket("quality")}
                />
              </div>
            </div>

            {/* Photo Evidence (global) */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Photo Evidence</h2>
              <SectionPhotos
                title="Evidence Photos"
                photos={sectionPhotos.evidence}
                setPhotos={setPhotoBucket("evidence")}
                summaryToggle
              />
              <p className="text-xs text-gray-500 mt-2">
                Tick “Summary” to include an image in the Summary exports. Add descriptions under each photo.
              </p>
            </div>

            {/* Signature */}
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
                    form,
                    [
                      ...sectionPhotos.weather,
                      ...sectionPhotos.safety,
                      ...sectionPhotos.work,
                      ...sectionPhotos.equipment,
                      ...sectionPhotos.incidents,
                      ...sectionPhotos.quality,
                      ...sectionPhotos.notes,
                      ...sectionPhotos.evidence,
                    ],
                    signatureData
                  )
                }
                className="flex-1 bg-kiwi-green hover:bg-kiwi-dark text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                Generate PDF Report
              </button>
              <button
                onClick={() => generateSummaryPDF(form, summaryPhotos)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                Download Summary (PDF)
              </button>
              <button
                onClick={() => generateSummaryWord(form, summaryPhotos)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                Download Summary (Word)
              </button>
            </div>
          </section>

          {/* RIGHT: PREVIEW + AUTO SUMMARY */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4">Live Preview</h2>

            <ReportPreview
  form={form}
  sectionPhotos={sectionPhotos}   // <-- NOT the merged array
  signatureData={signatureData}
/>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-kiwi-dark mb-3">Auto-Generated Summary</h3>
                <AutoSummary form={form} photos={summaryPhotos} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
