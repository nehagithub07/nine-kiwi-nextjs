// components/MapCard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  address: string;
  onCoords?: (lat: number, lon: number) => void;
  className?: string;
};

type Coords = { lat: number; lon: number };

export default function MapCard({ address, onCoords, className }: Props) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const cancelledRef = useRef(false);

  // Build interactive embed URL for screen (works without any key)
  const embedSrc = useMemo(() => {
    const q = address?.trim();
    return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : "";
  }, [address]);

  // Geocode address → coords (for weather + static map)
  useEffect(() => {
    cancelledRef.current = false;

    const run = async () => {
      const q = address?.trim();
      if (!q) {
        setCoords(null);
        return;
      }

      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=1`;
        const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
        const json = await resp.json();

        const first = json?.results?.[0];
        if (!cancelledRef.current && first) {
          const lat = Number(first.latitude);
          const lon = Number(first.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            setCoords({ lat, lon });
            onCoords?.(lat, lon);
          } else {
            setCoords(null);
          }
        }
      } catch {
        if (!cancelledRef.current) setCoords(null);
      }
    };

    run();
    return () => {
      cancelledRef.current = true;
    };
  }, [address, onCoords]);

  // Build static map URL for print/PDF. Prefer Google Static Maps if key exists.
  const staticUrl = useMemo(() => {
    if (!coords) return "";
    const gkey = process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY?.trim();

    if (gkey) {
      // Higher resolution (scale=2) for crisp PDFs
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lon}&zoom=15&size=800x400&scale=2&markers=color:green|${coords.lat},${coords.lon}&key=${gkey}`;
    }
    // Fallback to OSM Static Map (no key)
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lon}&zoom=15&size=800x400&markers=${coords.lat},${coords.lon},lightgreen-pushpin`;
  }, [coords]);

  // Nothing to show if no address
  if (!address?.trim()) return null;

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-kiwi-dark mb-2">Site Map</h3>

      {/* Screen view (interactive) */}
      {embedSrc && (
        <div className="rounded-xl overflow-hidden border screen-only">
          <iframe
            title="site-map"
            src={embedSrc}
            className="w-full"
            style={{ height: 280, border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* Print/PDF fallback (static image). html2canvas can capture this. */}
      {staticUrl && (
        <div className="rounded-xl overflow-hidden border print-only">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={staticUrl}
            alt="Static site map"
            className="w-full h-[280px] object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>
      )}

      <style jsx>{`
        @media print {
          .screen-only {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
