'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import ProgressBar from '../components/ProgressBar';
import WeatherPanel, { WeatherData } from '../components/WeatherPanel';
import FlexibleRating from '../components/FlexibleRating';
import PhotoUpload, { UPhoto } from '../components/PhotoUpload';
import SignaturePadBox from '../components/SignaturePad';
import ReportPreview from '../components/ReportPreview';
import AutoSummary from '../components/AutoSummary';

import {
  generateFullReportPDF,
  generateSummaryPDF,
  generateSummaryWord,
} from '../lib/export';

// ---------------- Types ----------------
type FlexMode = 'stars' | 'yesno';
type FlexFieldId =
  | 'weatherConditions'
  | 'safetyCompliance'
  | 'safetySignage'
  | 'equipmentCondition'
  | 'workmanshipQuality'
  | 'siteHousekeeping'
  | 'qualityRating'
  | 'communicationRating';

type FormData = {
  projectName: string;
  reportId: string;
  clientName: string;
  contractorName: string;
  inspectorName: string;
  supervisorName: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  inspectionDate: string;

  temperature: string;
  humidity: string;
  windSpeed: string;
  weatherDescription: string;
  weatherConditions: string;

  safetyCompliance: string;
  safetySignage: string;

  numWorkers: string;
  workerAttendance: string;

  workProgress: string;
  scheduleCompliance: string;
  materialAvailability: string;

  equipmentCondition: string;
  maintenanceStatus: string;

  workmanshipQuality: string;
  specificationCompliance: string;

  incidentsHazards: string;
  siteHousekeeping: string;
  stakeholderVisits: string;

  additionalComments: string;
  inspectorSummary: string;
  recommendations: string;

  qualityRating: string;
  communicationRating: string;
  recommendationRating: string;
  improvementAreas: string;

  signatureDateTime: string;

  flexibleModes: Record<FlexFieldId, FlexMode>;
};

// Only the keys in FormData whose values are strings (i.e., all of them here)
type StringKeys<T> = {
  [K in keyof T]-?: T[K] extends string ? K : never;
}[keyof T];

type FStrKey = StringKeys<FormData>;
type FFlexKey = keyof FormData & string;

// ---------------- Component ----------------
export default function Page() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UPhoto[]>([]);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(() => ({
    projectName: '',
    reportId: '',
    clientName: '',
    contractorName: '',
    inspectorName: '',
    supervisorName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    inspectionDate: '',
    temperature: '',
    humidity: '',
    windSpeed: '',
    weatherDescription: '',
    weatherConditions: '',
    safetyCompliance: '',
    safetySignage: '',
    numWorkers: '',
    workerAttendance: '',
    workProgress: '',
    scheduleCompliance: '',
    materialAvailability: '',
    equipmentCondition: '',
    maintenanceStatus: '',
    workmanshipQuality: '',
    specificationCompliance: '',
    incidentsHazards: '',
    siteHousekeeping: '',
    stakeholderVisits: '',
    additionalComments: '',
    inspectorSummary: '',
    recommendations: '',
    qualityRating: '',
    communicationRating: '',
    recommendationRating: '',
    improvementAreas: '',
    signatureDateTime: '',
    flexibleModes: {
      weatherConditions: 'stars',
      safetyCompliance: 'stars',
      safetySignage: 'stars',
      equipmentCondition: 'stars',
      workmanshipQuality: 'stars',
      siteHousekeeping: 'stars',
      qualityRating: 'stars',
      communicationRating: 'stars',
    },
  }));

  // Init dates on first load
  useEffect(() => {
    const now = new Date();
    setForm((f) => ({
      ...f,
      inspectionDate: now.toISOString().split('T')[0],
      signatureDateTime: now.toISOString().slice(0, 16),
    }));
  }, []);

  // -------- Field lists (typed so htmlFor/value are string-safe) --------
  const contactFields: ReadonlyArray<[FStrKey, string, string]> = [
    ['projectName', 'Project Name', 'Eg. Tower A Footings'],
    ['reportId', 'Report ID', 'Auto/Manual'],
    ['clientName', 'Client / Owner', 'Client name'],
    ['contractorName', 'Contractor', 'Contractor'],
    ['inspectorName', 'Inspector', 'Inspector name'],
    ['supervisorName', 'Site Supervisor', 'Supervisor name'],
    ['contactPhone', 'Phone', '+1 555 000 000'],
    ['contactEmail', 'Email', 'name@company.com'],
    ['location', 'Location', 'Site address'],
  ] as const;

  const noteFields: ReadonlyArray<[FStrKey, string, number, string]> = [
    ['additionalComments', 'Additional comments / observations', 3, ''],
    ['inspectorSummary', "Inspector's Summary (short)", 3, '1–3 concise bullet points…'],
    ['recommendations', 'Recommendations / next actions', 3, ''],
  ] as const;

  // -------- Derived state --------
  const filledPercent = useMemo(() => {
    const ids = [
      'projectName',
      'inspectorName',
      'location',
      'inspectionDate',
      'temperature',
      'humidity',
      'windSpeed',
      'weatherDescription',
      'weatherConditions',
      'safetyCompliance',
      'safetySignage',
      'numWorkers',
      'workerAttendance',
      'workProgress',
      'scheduleCompliance',
      'materialAvailability',
      'equipmentCondition',
      'maintenanceStatus',
      'workmanshipQuality',
      'specificationCompliance',
      'incidentsHazards',
      'siteHousekeeping',
      'stakeholderVisits',
      'additionalComments',
      'inspectorSummary',
      'recommendations',
      'qualityRating',
      'communicationRating',
      'recommendationRating',
      'improvementAreas',
      'signatureDateTime',
      'clientName',
      'contractorName',
      'supervisorName',
      'contactPhone',
      'contactEmail',
      'reportId',
    ] as FStrKey[];

    let filled = 0;
    ids.forEach((k) => {
      const v = form[k];
      if (typeof v === 'string' && v.trim() !== '') filled++;
    });
    return Math.round((filled / ids.length) * 100);
  }, [form]);

  const summaryPhotos = useMemo(() => {
    const selected = uploadedPhotos.filter((p) => p.includeInSummary);
    return selected.length ? selected : uploadedPhotos;
  }, [uploadedPhotos]);

  // -------- Handlers --------
  const onWeatherFetched = (w: WeatherData) => {
    setForm((f) => ({
      ...f,
      temperature: String(w.temperature),
      humidity: String(w.humidity),
      windSpeed: String(w.windSpeed),
      weatherDescription: w.description,
    }));
  };

  // Generic, type-safe setter for any string field
  const updateField = <K extends FStrKey>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Flexible rating setter
  const updateFlex = (id: FlexFieldId, mode: FlexMode, value: string) =>
    setForm((f) => ({
      ...f,
      [id]: value,
      flexibleModes: { ...f.flexibleModes, [id]: mode },
    }));

  // ---------------- Render ----------------
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
            {/* Progress */}
            <ProgressBar percent={filledPercent} />

            {/* Project & Contact */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
                  />
                </svg>
                Project & Contact
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactFields.map(([id, label, ph]) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" htmlFor={id}>
                      {label}
                    </label>
                    <input
                      id={id}
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                      placeholder={ph}
                      value={form[id]}
                      onChange={(e) => updateField(id, e.target.value)}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm mb-2" htmlFor="inspectionDate">
                    Date
                  </label>
                  <input
                    id="inspectionDate"
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.inspectionDate}
                    onChange={(e) => updateField('inspectionDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Weather */}
            <WeatherPanel
              form={form}
              onField={updateField}
              onFetched={onWeatherFetched}
              rating={
                <FlexibleRating
                  label="Weather impact today"
                  id="weatherConditions"
                  value={form.weatherConditions}
                  mode={form.flexibleModes.weatherConditions}
                  onChange={(mode, val) => updateFlex('weatherConditions', mode, val)}
                />
              }
            />

            {/* Safety */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                Safety & Compliance
              </h2>

              <div className="space-y-5">
                <FlexibleRating
                  label="All safety protocols & PPE followed?"
                  id="safetyCompliance"
                  value={form.safetyCompliance}
                  mode={form.flexibleModes.safetyCompliance}
                  onChange={(m, v) => updateFlex('safetyCompliance', m, v)}
                />
                <FlexibleRating
                  label="Safety signage & access control in place?"
                  id="safetySignage"
                  value={form.safetySignage}
                  mode={form.flexibleModes.safetySignage}
                  onChange={(m, v) => updateFlex('safetySignage', m, v)}
                />
              </div>
            </div>

            {/* Personnel & Work */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2" />
                </svg>
                Personnel & Work Progress
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" htmlFor="numWorkers">
                    Workers on site
                  </label>
                  <input
                    id="numWorkers"
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.numWorkers}
                    onChange={(e) => updateField('numWorkers', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">All workers present & on time?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="workerAttendance"
                          value={v}
                          checked={form.workerAttendance === v}
                          onChange={(e) => updateField('workerAttendance', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2" htmlFor="workProgress">
                    Current work progress summary
                  </label>
                  <textarea
                    id="workProgress"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    placeholder="Key activities, trades, locations…"
                    value={form.workProgress}
                    onChange={(e) => updateField('workProgress', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Progress vs schedule</label>
                  <div className="flex gap-4">
                    {['Ahead', 'On Track', 'Behind'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="scheduleCompliance"
                          value={v}
                          checked={form.scheduleCompliance === v}
                          onChange={(e) => updateField('scheduleCompliance', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Materials available & usable?</label>
                  <div className="flex gap-4">
                    {['Yes', 'Partial', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="materialAvailability"
                          value={v}
                          checked={form.materialAvailability === v}
                          onChange={(e) => updateField('materialAvailability', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment & Quality */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317" />
                </svg>
                Equipment & Quality
              </h2>

              <div className="space-y-5">
                <FlexibleRating
                  label="Condition of tools/equipment/machinery"
                  id="equipmentCondition"
                  value={form.equipmentCondition}
                  mode={form.flexibleModes.equipmentCondition}
                  onChange={(m, v) => updateFlex('equipmentCondition', m, v)}
                />

                <div>
                  <label className="block text-sm mb-2">Equipment maintenance up to date?</label>
                  <div className="flex gap-4">
                    {['Yes', 'Partial', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maintenanceStatus"
                          value={v}
                          checked={form.maintenanceStatus === v}
                          onChange={(e) => updateField('maintenanceStatus', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <FlexibleRating
                  label="Quality of workmanship"
                  id="workmanshipQuality"
                  value={form.workmanshipQuality}
                  mode={form.flexibleModes.workmanshipQuality}
                  onChange={(m, v) => updateFlex('workmanshipQuality', m, v)}
                />

                <div>
                  <label className="block text-sm mb-2">Work per specs?</label>
                  <div className="flex gap-4">
                    {['Yes', 'Mostly', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="specificationCompliance"
                          value={v}
                          checked={form.specificationCompliance === v}
                          onChange={(e) => updateField('specificationCompliance', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Incidents & Site */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2" />
                </svg>
                Incidents & Site Conditions
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-2">
                    Any incidents, near misses, or hazards today?
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="incidentsHazards"
                          value={v}
                          checked={form.incidentsHazards === v}
                          onChange={(e) => updateField('incidentsHazards', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <FlexibleRating
                  label="Housekeeping / cleanliness / waste mgmt"
                  id="siteHousekeeping"
                  value={form.siteHousekeeping}
                  mode={form.flexibleModes.siteHousekeeping}
                  onChange={(m, v) => updateFlex('siteHousekeeping', m, v)}
                />

                <div>
                  <label className="block text-sm mb-2">Any stakeholder/inspector visits?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="stakeholderVisits"
                          value={v}
                          checked={form.stakeholderVisits === v}
                          onChange={(e) => updateField('stakeholderVisits', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Summary */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7" />
                </svg>
                Notes & Summary
              </h2>

              <div className="space-y-4">
                {noteFields.map(([id, label, rows, ph]) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" htmlFor={id}>
                      {label}
                    </label>
                    <textarea
                      id={id}
                      rows={rows}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                      placeholder={ph}
                      value={form[id]}
                      onChange={(e) => updateField(id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Survey */}
            <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7" />
                </svg>
                Quality Survey
              </h2>

              <div className="grid grid-cols-1 gap-5">
                <FlexibleRating
                  label="Overall project quality"
                  id="qualityRating"
                  value={form.qualityRating}
                  mode={form.flexibleModes.qualityRating}
                  onChange={(m, v) => updateFlex('qualityRating', m, v)}
                />

                <FlexibleRating
                  label="Team communication"
                  id="communicationRating"
                  value={form.communicationRating}
                  mode={form.flexibleModes.communicationRating}
                  onChange={(m, v) => updateFlex('communicationRating', m, v)}
                />

                <div>
                  <label className="block text-sm mb-2">
                    Recommend contractor/team for future?
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'Maybe', 'No'].map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="recommendationRating"
                          value={v}
                          checked={form.recommendationRating === v}
                          onChange={(e) => updateField('recommendationRating', e.target.value)}
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2" htmlFor="improvementAreas">
                    Areas for improvement
                  </label>
                  <textarea
                    id="improvementAreas"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
                    value={form.improvementAreas}
                    onChange={(e) => updateField('improvementAreas', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <PhotoUpload photos={uploadedPhotos} setPhotos={setUploadedPhotos} />

            {/* Signature */}
            <SignaturePadBox
              signatureData={signatureData}
              setSignatureData={setSignatureData}
              value={form.signatureDateTime}
              onDate={(v) => updateField('signatureDateTime', v)}
              signer={form.inspectorName}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button
                onClick={() => generateFullReportPDF(form, uploadedPhotos, signatureData)}
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
              <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-kiwi-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0" />
                </svg>
                Live Preview
              </h2>

              <ReportPreview form={form} photos={uploadedPhotos} signatureData={signatureData} />

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-kiwi-dark mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-kiwi-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4" />
                  </svg>
                  Auto-Generated Summary
                </h3>

                <AutoSummary form={form} photos={summaryPhotos} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
