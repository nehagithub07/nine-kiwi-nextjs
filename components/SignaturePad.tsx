"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  signatureData: string | null;
  setSignatureData: (v: string | null)=>void;
  value: string;
  onDate: (v: string)=>void;
  signer: string;
};

export default function SignaturePadBox({ signatureData, setSignatureData, value, onDate, signer }: Props){
  const [mode, setMode] = useState<'draw'|'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const isDrawingRef = useRef(false);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    const pos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX) - r.left;
      const y = ('touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY) - r.top;
      return {x,y};
    };

    const start = (e: any) => { isDrawingRef.current = true; draw(e); };
    const draw = (e: any) => {
      if(!isDrawingRef.current) return;
      const p = pos(e);
      if(!p || !ctx) return;
      ctx.lineWidth=2; ctx.lineCap='round'; ctx.strokeStyle='#1A202C';
      ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y);
    };
    const stop = () => { if(isDrawingRef.current){ isDrawingRef.current=false; ctx?.beginPath(); } };

    canvas.addEventListener('mousedown',start);
    canvas.addEventListener('mousemove',draw);
    canvas.addEventListener('mouseup',stop);
    canvas.addEventListener('mouseleave',stop);
    canvas.addEventListener('touchstart',start,{passive:true});
    canvas.addEventListener('touchmove',draw,{passive:true});
    canvas.addEventListener('touchend',stop);

    return ()=> {
      canvas.removeEventListener('mousedown',start);
      canvas.removeEventListener('mousemove',draw);
      canvas.removeEventListener('mouseup',stop);
      canvas.removeEventListener('mouseleave',stop);
      canvas.removeEventListener('touchstart',start);
      canvas.removeEventListener('touchmove',draw);
      canvas.removeEventListener('touchend',stop);
    };
  },[]);

  const clear = () => {
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext('2d'); if(!ctx) return;
    ctx.clearRect(0,0,c.width,c.height);
    setSignatureData(null);
  };

  const save = () => {
    const c = canvasRef.current; if(!c) return;
    setSignatureData(c.toDataURL());
    alert('Signature saved!');
  };

  const handleUpload = (file?: File) => {
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => setSignatureData(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-kiwi-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232"/></svg>
        Digital Signature
      </h2>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button type="button"
            onClick={()=>setMode('draw')}
            className={`flex-1 ${mode==='draw' ? 'bg-kiwi-green hover:bg-kiwi-dark' : 'bg-gray-500 hover:bg-gray-600'} text-white px-4 py-2 rounded-lg transition`}>
            Draw Signature
          </button>
          <button type="button"
            onClick={()=>setMode('upload')}
            className={`flex-1 ${mode==='upload' ? 'bg-kiwi-green hover:bg-kiwi-dark' : 'bg-gray-500 hover:bg-gray-600'} text-white px-4 py-2 rounded-lg transition`}>
            Upload Signature
          </button>
        </div>

        {mode==='draw' ? (
          <div>
            <label className="block text-sm mb-2">Draw Inspector Signature</label>
            <canvas ref={canvasRef} width={400} height={150} className="signature-pad bg-gray-50 w-full max-w-md" />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={clear} className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Clear</button>
              <button type="button" onClick={save} className="text-sm bg-kiwi-green text-white px-3 py-1 rounded hover:bg-kiwi-dark">Save</button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-2">Upload Signature Image</label>
            <div className="border-2 border-dashed border-kiwi-green rounded-lg p-4 text-center">
              <input
                id="signatureImageUpload"
                type="file" accept="image/*" className="hidden"
                onChange={(e)=>handleUpload(e.target.files?.[0]||undefined)}
              />
              <button type="button"
                onClick={()=>document.getElementById('signatureImageUpload')?.click()}
                className="bg-kiwi-green text-white px-3 py-1 text-sm rounded hover:bg-kiwi-dark">
                Choose Image
              </button>
            </div>
            {signatureData && <img src={signatureData} className="max-h-20 border rounded mt-2" alt="Signature" />}
          </div>
        )}

        <div>
          <label className="block text-sm mb-2" htmlFor="signatureDateTime">Signature Date & Time</label>
          <input id="signatureDateTime" type="datetime-local"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            value={value} onChange={(e)=>onDate(e.target.value)} />
        </div>

        {signatureData && signer && (
          <div className="text-sm text-kiwi-gray">
            <b>Signed By:</b> {signer}
          </div>
        )}
      </div>
    </div>
  );
}
