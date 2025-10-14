"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function VoiceCapture() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recogRef = useRef<any>(null);
  const appendModeRef = useRef(true); // true=append, false=replace

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    if (!SR) return;
    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (ev: any) => {
      try {
        const results: SpeechRecognitionResultList = ev.results;
        let finalText = "";
        for (let i = ev.resultIndex; i < results.length; i++) {
          const res = results[i];
          if (res.isFinal) finalText += res[0].transcript + " ";
        }
        finalText = finalText.trim();
        if (!finalText) return;
        const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
          const prev = appendModeRef.current ? (active as any).value + (active.value ? " " : "") : "";
          (active as any).value = (prev + finalText).trim();
          active.dispatchEvent(new Event("input", { bubbles: true }));
          active.focus();
        }
      } catch (e: any) {
        setError(e?.message || "Voice input failed");
      }
    };

    r.onerror = (e: any) => {
      setError(e?.error || "Speech recognition error");
      setListening(false);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    return () => {
      try { r.stop(); } catch {}
    };
  }, []);

  function toggle() {
    if (!supported) return;
    setError(null);
    const r = recogRef.current;
    try {
      if (!listening) { r.start(); setListening(true); }
      else { r.stop(); }
    } catch (e: any) {
      setError(e?.message || "Could not start mic");
      setListening(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="fixed z-40 bottom-5 right-5 flex flex-col items-end gap-2 no-print">
      <div className="flex items-center gap-2 bg-white/90 border rounded-full px-3 py-1 shadow">
        <label className="text-xs text-gray-700 select-none">
          <input type="checkbox" className="mr-1 align-middle" defaultChecked onChange={(e)=> (appendModeRef.current = e.target.checked)} />
          Append
        </label>
        <button
          onClick={toggle}
          title="Voice to text: click then speak; click again to stop. Text goes into the focused field."
          className={`h-11 w-11 rounded-full grid place-items-center ${listening ? "bg-red-500" : "bg-kiwi-green"} text-white shadow hover:opacity-95`}
        >
          {listening ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z"/><path d="M19 11a7 7 0 11-14 0H3a9 9 0 0018 0h-2z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3z"/><path d="M19 11a7 7 0 11-14 0H3a9 9 0 0018 0h-2z"/></svg>
          )}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 shadow">{error}</div>}
    </div>
  );
}

