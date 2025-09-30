"use client";
export type UPhoto = { name: string; data: string; includeInSummary: boolean };

type Props = {
  photos: UPhoto[];
  setPhotos: (p: UPhoto[])=>void;
};

export default function PhotoUpload({ photos, setPhotos }: Props){
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    arr.forEach(file=>{
      const reader = new FileReader();
      reader.onload = e => {
        setPhotos([...photos, { name: file.name, data: String(e.target?.result||''), includeInSummary: false }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSummary = (i:number, checked:boolean) => {
    const next = [...photos];
    next[i].includeInSummary = checked;
    setPhotos(next);
  };

  const removePhoto = (i:number) => {
    const next = [...photos];
    next.splice(i,1);
    setPhotos(next);
  };

  return (
    <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-kiwi-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2"/></svg>
        Photo Evidence
      </h2>

      <div className="border-2 border-dashed border-kiwi-green rounded-lg p-6 text-center">
        <input id="photoUpload" type="file" accept="image/*" multiple className="hidden" onChange={(e)=>addFiles(e.target.files)} />
        <div className="text-kiwi-green mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6"/></svg>
        </div>
        <p className="mb-2">Click to upload or drag & drop photos</p>
        <button type="button" onClick={()=>document.getElementById('photoUpload')?.click()}
          className="bg-kiwi-green text-white px-4 py-2 rounded-lg hover:bg-kiwi-dark transition">
          Choose Photos
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Tick “Summary” to include an image in the summary exports. Add your own caption under each photo.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((p,i)=>(
          <div key={i} className="relative group border rounded-lg overflow-hidden">
            <img src={p.data} alt={p.name} className="w-full h-32 object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-2 flex items-center justify-between">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={p.includeInSummary} onChange={(e)=>toggleSummary(i,e.target.checked)} />
                <span>Summary</span>
              </label>
              <button onClick={()=>removePhoto(i)} className="px-2 py-0.5 bg-red-500 rounded">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
