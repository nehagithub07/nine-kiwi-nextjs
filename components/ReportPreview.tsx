import Image from "next/image";

function fmtDate(s?: string){ return s ? new Date(s).toLocaleDateString() : new Date().toLocaleDateString(); }
function starText(n?: string){
  const v = parseInt(n||'0'); if(!v) return 'Not Rated';
  return ['','Poor (1/5)','Below Average (2/5)','Average (3/5)','Good (4/5)','Excellent (5/5)'][v];
}
function flexAnswer(id:string, form:any){
  const mode = form.flexibleModes?.[id] || 'stars';
  const v = form[id] || '';
  return mode==='yesno' ? (v || 'N/A') : starText(v);
}

export default function ReportPreview({ form, photos, signatureData }:{
  form:any; photos:{name:string,data:string}[]; signatureData:string|null;
}){
  if(!form.projectName){
    return (
      <div id="reportPreview" className="report-preview border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-96">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6"/></svg>
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
    form.incidentsHazards && `Incidents: ${form.incidentsHazards}`
  ].filter(Boolean) as string[];

  return (
    <div id="reportPreview" className="report-preview border border-gray-200 rounded-lg p-6 bg-white">
      {/* Header */}
      <div className="mb-6 pb-5 border-b-2 border-kiwi-green">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg grid place-items-center">
              <Image src="/logo.png" alt="nineKiwi_logo" width={48} height={48} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-kiwi-dark">NineKiwi Inspection Report</h1>
              <p className="text-xs text-kiwi-gray">Generated {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right text-sm space-x-1">
            {chips.map((c,i)=><span key={i} className="pill">{c}</span>)}
          </div>
        </div>
      </div>

      {/* Project & Contact */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Project & Contact</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Project:</strong> {form.projectName||'N/A'}</div>
          <div><strong>Date:</strong> {fmtDate(form.inspectionDate)}</div>
          <div><strong>Client:</strong> {form.clientName||'N/A'}</div>
          <div><strong>Contractor:</strong> {form.contractorName||'N/A'}</div>
          <div><strong>Inspector:</strong> {form.inspectorName||'N/A'}</div>
          <div><strong>Supervisor:</strong> {form.supervisorName||'N/A'}</div>
          <div><strong>Phone:</strong> {form.contactPhone||'N/A'}</div>
          <div><strong>Email:</strong> {form.contactEmail||'N/A'}</div>
          <div className="col-span-2"><strong>Location:</strong> {form.location||'N/A'}</div>
        </div>
      </div>

      {(form.temperature||form.weatherDescription) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Weather</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Description:</strong> {form.weatherDescription||'N/A'}</div>
            <div><strong>Impact Rating:</strong> {flexAnswer('weatherConditions',form)}</div>
            <div><strong>Temp:</strong> {form.temperature||'N/A'}°C</div>
            <div><strong>Humidity:</strong> {form.humidity||'N/A'}%</div>
            <div><strong>Wind:</strong> {form.windSpeed||'N/A'} km/h</div>
          </div>
        </div>
      )}

      {/* Inspection table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Inspection</h2>
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead><tr className="bg-kiwi-light">
            <th className="border p-2 text-left">Question</th><th className="border p-2 text-left">Response</th></tr></thead>
          <tbody>
            <tr><td className="border p-2">PPE & safety protocols followed?</td><td className="border p-2">{flexAnswer('safetyCompliance',form)}</td></tr>
            <tr><td className="border p-2">Safety signage/access control?</td><td className="border p-2">{flexAnswer('safetySignage',form)}</td></tr>
            <tr><td className="border p-2">Workers on site</td><td className="border p-2">{form.numWorkers||'0'}</td></tr>
            <tr><td className="border p-2">Attendance & punctuality</td><td className="border p-2">{form.workerAttendance||'N/A'}</td></tr>
            <tr><td className="border p-2">Progress vs schedule</td><td className="border p-2">{form.scheduleCompliance||'N/A'}</td></tr>
            <tr><td className="border p-2">Materials availability</td><td className="border p-2">{form.materialAvailability||'N/A'}</td></tr>
            <tr><td className="border p-2">Equipment condition</td><td className="border p-2">{flexAnswer('equipmentCondition',form)}</td></tr>
            <tr><td className="border p-2">Maintenance status</td><td className="border p-2">{form.maintenanceStatus||'N/A'}</td></tr>
            <tr><td className="border p-2">Workmanship quality</td><td className="border p-2">{flexAnswer('workmanshipQuality',form)}</td></tr>
            <tr><td className="border p-2">Work per specifications?</td><td className="border p-2">{form.specificationCompliance||'N/A'}</td></tr>
            <tr><td className="border p-2">Incidents / hazards today?</td><td className="border p-2">{form.incidentsHazards||'N/A'}</td></tr>
            <tr><td className="border p-2">Housekeeping / cleanliness</td><td className="border p-2">{flexAnswer('siteHousekeeping',form)}</td></tr>
            <tr><td className="border p-2">Stakeholder/inspector visits</td><td className="border p-2">{form.stakeholderVisits||'N/A'}</td></tr>
            <tr><td className="border p-2">Work progress summary</td><td className="border p-2 whitespace-pre-line">{form.workProgress||'N/A'}</td></tr>
            <tr><td className="border p-2">Additional comments</td><td className="border p-2 whitespace-pre-line">{form.additionalComments||'N/A'}</td></tr>
          </tbody>
        </table>
      </div>

      {(form.qualityRating||form.communicationRating||form.recommendationRating||form.improvementAreas) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Quality Survey</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Overall Quality:</strong> {flexAnswer('qualityRating',form)}</div>
            <div><strong>Team Communication:</strong> {flexAnswer('communicationRating',form)}</div>
            <div><strong>Recommend Team:</strong> {form.recommendationRating||'N/A'}</div>
            {form.improvementAreas && <div className="col-span-2"><strong>Improvement Areas:</strong> {form.improvementAreas}</div>}
          </div>
        </div>
      )}

      {!!photos.length && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Photo Evidence</h2>
          <div className="grid grid-cols-2 gap-6">
            {photos.map((p,i)=>(
              <figure key={i} className="border rounded overflow-hidden bg-white">
                <img src={p.data} alt={p.name} className="w-full h-40 object-cover" />
                <figcaption className="text-xs p-2 text-center text-gray-600">{p.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {(form.inspectorSummary || form.recommendations) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Summary & Recommendations</h2>
          {form.inspectorSummary && <div className="mb-3"><strong>Summary:</strong><br/>{form.inspectorSummary}</div>}
          {form.recommendations && <div><strong>Recommendations:</strong><br/>{form.recommendations}</div>}
        </div>
      )}

      {signatureData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-kiwi-dark mb-3 bg-kiwi-light p-3 rounded">Digital Sign-off</h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm font-semibold mb-2">Inspector Signature:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureData} className="border rounded" style={{maxHeight:100}} alt="Signature" />
            </div>
            <div className="text-sm">
              <p><strong>Signed By:</strong> {form.inspectorName || 'N/A'}</p>
              <p><strong>Date & Time:</strong> {form.signatureDateTime ? new Date(form.signatureDateTime).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
