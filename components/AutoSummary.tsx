function toScore(v: string){
  if(v==='Yes') return 5;
  if(v==='No') return 1;
  const n = parseInt(v||'0',10);
  return isNaN(n)?0:n;
}
const starOrYN = (id:string,form:any)=>{
  const mode = form.flexibleModes?.[id]||'stars';
  const v = form[id]||'';
  return mode==='yesno' ? (v||'N/A') : (toScore(v) ? `${toScore(v)}/5` : 'Not Rated');
};

export default function AutoSummary({ form, photos }:{ form:any; photos:{name:string,data:string}[] }){
  if(!form.projectName){
    return <div id="autoSummary" className="bg-kiwi-light border border-kiwi-green/20 rounded-lg p-4 text-sm">
      <p className="text-kiwi-gray italic">Summary is generated from your inputs (images supported).</p>
    </div>;
  }

  const safety=toScore(form.safetyCompliance), signage=toScore(form.safetySignage),
        equip=toScore(form.equipmentCondition), workm=toScore(form.workmanshipQuality),
        house=toScore(form.siteHousekeeping), weatherScore=toScore(form.weatherConditions),
        quality=toScore(form.qualityRating);

  let status:'satisfactory'|'needs attention'|'requires immediate attention' = 'satisfactory';
  const critical:string[] = [], good:string[] = [], recs:string[] = [];

  if (safety<=2 || signage<=2){ critical.push('Safety compliance/signage concerns'); status='requires immediate attention'; recs.push('Reinforce PPE & access controls; run toolbox talk'); }
  else if (safety>=4 && signage>=4) good.push('Strong safety culture and clear signage');

  if (workm<=2 || form.specificationCompliance==='No'){ critical.push('Quality deviations from specs'); if(status==='satisfactory') status='needs attention'; recs.push('Increase QC checks; rectify non-conformances'); }
  else if (workm>=4 && form.specificationCompliance==='Yes') good.push('High-quality workmanship aligned to specs');

  if (form.incidentsHazards==='Yes'){ critical.push('Incident(s) reported'); status='requires immediate attention'; recs.push('Conduct incident review; implement corrective actions'); }

  if (house<=2){ critical.push('Housekeeping below standard'); recs.push('Improve cleanliness and waste segregation'); }
  else if (house>=4){ good.push('Site housekeeping in good order'); }

  let weatherImpactNote = '';
  if (weatherScore<=2){ weatherImpactNote='Adverse weather impacted productivity.'; recs.push('Monitor forecast; adjust plan/schedule'); }
  else if (weatherScore>=4){ weatherImpactNote='Favorable weather supported progress.'; }

  if (quality>=4) good.push(`Overall quality trending strong (${quality}/5)`);
  else if (quality>0 && quality<=2){ critical.push(`Overall quality low (${quality}/5)`); if(status==='satisfactory') status='needs attention'; }

  const color = status==='satisfactory' ? 'text-green-600' : status==='needs attention' ? 'text-yellow-600' : 'text-red-600';

  const infoRow = (
    <div className="text-[13px] text-kiwi-gray mt-1">
      <b>Project:</b> {form.projectName} &nbsp;|&nbsp; <b>Location:</b> {form.location||'N/A'} &nbsp;|&nbsp;
      <b>Date:</b> {form.inspectionDate ? new Date(form.inspectionDate).toLocaleDateString() : new Date().toLocaleDateString()} &nbsp;|&nbsp;
      <b>Workers:</b> {form.numWorkers||'0'}
    </div>
  );

  const weatherRow = (form.temperature || form.weatherDescription) && (
    <div className="text-[13px] text-kiwi-gray">
      <b>Weather:</b> {form.weatherDescription || 'N/A'} &nbsp;|&nbsp;
      <b>Rating:</b> {starOrYN('weatherConditions', form)} &nbsp;|&nbsp;
      <b>Temp:</b> {form.temperature || 'N/A'}°C &nbsp;|&nbsp;
      <b>Humidity:</b> {form.humidity || 'N/A'}% &nbsp;|&nbsp;
      <b>Wind:</b> {form.windSpeed || 'N/A'} km/h
    </div>
  );

  const List = ({ title, items, tone }:{ title:string; items:string[]; tone:'red'|'green'|'blue'}) => {
    if (!items.length) return null;
    const colors = tone==='red'
      ? {border:'border-red-400',bg:'bg-red-50',title:'text-red-800',text:'text-red-700'}
      : tone==='green'
      ? {border:'border-green-400',bg:'bg-green-50',title:'text-green-800',text:'text-green-700'}
      : {border:'border-blue-400',bg:'bg-blue-50',title:'text-blue-800',text:'text-blue-700'};
    return (
      <div className={`border-l-4 ${colors.border} ${colors.bg} p-3 rounded`}>
        <div className={`font-semibold ${colors.title}`}>{title}</div>
        <ul className={`${colors.text} text-sm mt-1 list-disc list-inside`}>
          {items.map((i,idx)=><li key={idx}>{i}</li>)}
        </ul>
      </div>
    );
  };

  return (
    <div id="autoSummary" className="bg-kiwi-light border border-kiwi-green/20 rounded-lg p-4 text-sm">
      <div className="space-y-3">
        <div className={`font-semibold ${color} text-lg`}>📋 Project Status: {status.replace(/\b\w/g, c => c.toUpperCase())}</div>
        {infoRow}
        {weatherRow}
        <List title="⚠️ Critical Issues" items={critical} tone="red" />
        <List title="✅ Positive Highlights" items={good} tone="green" />

        {form.inspectorSummary && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="font-semibold text-gray-800 mb-1">📝 Inspector Notes</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{form.inspectorSummary}</div>
          </div>
        )}

        {form.workProgress && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="font-semibold text-gray-800 mb-1">📌 Work Progress</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{form.workProgress}</div>
          </div>
        )}

        <List title="💡 Recommendations" items={recs} tone="blue" />

        {weatherImpactNote && (
          <div className="text-sm text-kiwi-gray italic">🌤️ {weatherImpactNote}</div>
        )}

        {!!photos.length && (
          <div className="mt-2">
            <div className="text-sm font-semibold mb-1">📷 Summary Photos</div>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((p,i)=>(
                <figure key={i} className="border rounded overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.data} alt={p.name} className="w-full h-24 object-cover" />
                  <figcaption className="text-[11px] text-center p-1 text-gray-600">{p.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
