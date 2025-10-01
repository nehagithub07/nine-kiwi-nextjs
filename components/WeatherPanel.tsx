// components/WeatherPanel.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WeatherOut = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
};

type Props = {
  form: any;
  onField: (key: string, value: string) => void;
  onFetched?: (w: WeatherOut) => void;
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export default function WeatherPanel({ form, onField, onFetched }: Props) {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const debTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

  const addressQuery = useMemo(() => {
    const parts = [form?.streetAddress, form?.city, form?.state, form?.country, form?.zipCode].filter(
      (x: string) => typeof x === "string" && x.trim()
    );
    return (parts.join(", ") || form?.location || "").trim();
  }, [form]);

  const pushToForm = useCallback(
    (w: WeatherOut) => {
      onField("temperature", String(w.temperature));
      onField("humidity", String(w.humidity));
      onField("windSpeed", String(w.windSpeed));
      onField("weatherDescription", w.description);
      onFetched?.(w);
    },
    [onField, onFetched]
  );

  const parseOneCall = (data: any): WeatherOut => {
    const c = data?.current || data;
    const descRaw =
      c?.weather && Array.isArray(c.weather) && c.weather[0]?.description
        ? c.weather[0].description
        : c?.weather && Array.isArray(c.weather) && c.weather[0]?.main
        ? c.weather[0].main
        : "";
    const temp = Number(c?.temp);
    const hum = Number(c?.humidity);
    const wind = Number(c?.wind_speed);

    return {
      temperature: Number.isFinite(temp) ? Math.round(temp) : 0,
      humidity: Number.isFinite(hum) ? Math.round(hum) : 0,
      windSpeed: Number.isFinite(wind) ? Math.round(wind) : 0,
      description: toTitleCase(descRaw || ""),
    };
  };

  const fetchOneCallByCoords = useCallback(
    async (lat: number, lon: number) => {
      setErrMsg(null);
      if (!API_KEY) {
        setErrMsg("Missing NEXT_PUBLIC_OPENWEATHER_API_KEY.");
        return;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setErrMsg("Invalid coordinates.");
        return;
      }

      const key = `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
      if (lastKeyRef.current === key && !loading) return;
      lastKeyRef.current = key;

      setLoading(true);
      try {
        // Try One Call 3.0
        let resp = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily,minutely,alerts&units=metric&appid=${API_KEY}`
        );
        let data = await resp.json();

        if (!resp.ok || (typeof data?.cod !== "undefined" && Number(data.cod) >= 400)) {
          // Fallback to Current Weather v2.5 (works on free tier)
          resp = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );
          data = await resp.json();

          if (!resp.ok || (typeof data?.cod !== "undefined" && Number(data.cod) >= 400)) {
            setErrMsg(
              typeof data?.message === "string"
                ? `Weather error: ${data.message}`
                : `Weather API error (HTTP ${resp.status}).`
            );
            return;
          }

          const w: WeatherOut = {
            temperature: Math.round(Number(data?.main?.temp ?? 0)),
            humidity: Math.round(Number(data?.main?.humidity ?? 0)),
            windSpeed: Math.round(Number(data?.wind?.speed ?? 0)),
            description: toTitleCase(String(data?.weather?.[0]?.description ?? "")),
          };
          pushToForm(w);
          return;
        }

        // Success via One Call 3.0
        const w = parseOneCall(data);
        pushToForm(w);
      } catch {
        setErrMsg("Failed to fetch weather.");
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, pushToForm, loading]
  );

  // Geocode address → coords (Open-Meteo free geocoder), then fetch weather
  const fetchByAddress = useCallback(async () => {
    setErrMsg(null);

    if (!API_KEY) {
      setErrMsg("Missing NEXT_PUBLIC_OPENWEATHER_API_KEY.");
      return;
    }
    const q = addressQuery;
    if (!q) return;

    setLoading(true);
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`);
      const j = await geo.json();
      const first = j?.results?.[0];
      if (!first) {
        setErrMsg("Could not geocode address.");
        return;
      }
      const lat = Number(first.latitude);
      const lon = Number(first.longitude);

      // persist coords so Map/Preview/PDF stay in sync
      onField("lat", String(lat));
      onField("lon", String(lon));

      await fetchOneCallByCoords(lat, lon);
    } catch {
      setErrMsg("Geocoding failed.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY, addressQuery, fetchOneCallByCoords, onField]);

  // Debounced AUTO fetch when address fields change
  useEffect(() => {
    if (!addressQuery) return;
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(fetchByAddress, 600);
    return () => {
      if (debTimer.current) clearTimeout(debTimer.current);
    };
  }, [addressQuery, fetchByAddress]);

  // AUTO fetch when lat/lon are present (e.g., from MapCard onCoords)
  useEffect(() => {
    const lat = Number(form?.lat);
    const lon = Number(form?.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      fetchOneCallByCoords(lat, lon);
    }
  }, [form?.lat, form?.lon, fetchOneCallByCoords]);

  const handleUseMyLocation = useCallback(() => {
    setErrMsg(null);
    if (!navigator.geolocation) {
      setErrMsg("Geolocation not supported.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onField("lat", String(latitude));
        onField("lon", String(longitude));
        fetchOneCallByCoords(latitude, longitude);
      },
      () => {
        setErrMsg("Location permission denied.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [fetchOneCallByCoords, onField]);

  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Temp (°C)</div>
          <div className="font-semibold">{form?.temperature || "—"}</div>
        </div>
        <div>
          <div className="text-gray-500">Humidity (%)</div>
          <div className="font-semibold">{form?.humidity || "—"}</div>
        </div>
        <div>
          <div className="text-gray-500">Wind (m/s)</div>
          <div className="font-semibold">{form?.windSpeed || "—"}</div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-gray-500">Conditions</div>
          <div className="font-semibold">{form?.weatherDescription || "—"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-60"
          onClick={fetchByAddress}
          disabled={loading || !addressQuery}
          title={addressQuery ? `Use address: ${addressQuery}` : "Enter address fields first"}
        >
          Use address
        </button>

        <button
          type="button"
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          onClick={handleUseMyLocation}
          disabled={loading}
        >
          Use my location
        </button>

        {errMsg && <span className="text-xs text-red-600">{errMsg}</span>}
      </div>
    </div>
  );
}
