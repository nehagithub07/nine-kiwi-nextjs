// components/MapCard.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  address: string;
  onCoords?: (lat: number, lon: number) => void; // optional
  className?: string;
};

export default function MapCard({ address, onCoords, className }: Props) {
  const [src, setSrc] = useState<string>("");
  const [status, setStatus] = useState<"idle"|"loading"|"ready">("idle");

  useEffect(() => {
    if (!address?.trim()) { setSrc(""); return; }
    setStatus("loading");
    // Google Maps embed by query (no key required)
    const url = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    setSrc(url);
    setStatus("ready");
  }, [address]);

  useEffect(() => {
    let cancelled = false;
    async function geocode() {
      if (!address?.trim() || !onCoords) return;
      try {
        const resp = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1`
        );
        const json = await resp.json();
        if (!cancelled && json?.results?.[0]) {
          const { latitude, longitude } = json.results[0];
          onCoords(latitude, longitude);
        }
      } catch {/* ignore */}
    }
    geocode();
    return () => { cancelled = true; };
  }, [address, onCoords]);

  if (!address?.trim()) return null;

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-kiwi-dark mb-2">Site Map</h3>
      <div className="rounded-xl overflow-hidden border">
        {src ? (
          <iframe
            title="site-map"
            src={src}
            className="w-full"
            style={{ height: 280, border: 0 }}
            loading="lazy"
          />
        ) : (
          <div className="p-6 text-sm text-gray-500">Enter a location to see the map…</div>
        )}
      </div>
    </div>
  );
}
