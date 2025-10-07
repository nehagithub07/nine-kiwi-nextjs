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

function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return codes[code] || "Unknown";
}

export default function WeatherPanel({ form, onField, onFetched }: Props) {
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
      if (typeof onField !== "function") {
        console.error("onField is not a function:", onField);
        return;
      }
      onField("temperature", String(w.temperature));
      onField("humidity", String(w.humidity));
      onField("windSpeed", String(w.windSpeed));
      onField("weatherDescription", w.description);
      onFetched?.(w);
    },
    [onField, onFetched]
  );

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number) => {
      setErrMsg(null);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setErrMsg("Invalid coordinates.");
        return;
      }

      const key = `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
      if (lastKeyRef.current === key && !loading) return;
      lastKeyRef.current = key;

      setLoading(true);
      try {
        const resp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=ms`
        );

        if (!resp.ok) {
          setErrMsg(`Weather API error (HTTP ${resp.status}).`);
          return;
        }

        const data = await resp.json();
        const current = data?.current;

        if (!current) {
          setErrMsg("No weather data available for this location.");
          return;
        }

        const w: WeatherOut = {
          temperature: Math.round(Number(current.temperature_2m ?? 0)),
          humidity: Math.round(Number(current.relative_humidity_2m ?? 0)),
          windSpeed: Math.round(Number(current.wind_speed_10m ?? 0)),
          description: getWeatherDescription(Number(current.weather_code ?? 0)),
        };

        pushToForm(w);
      } catch (error) {
        console.error("Weather fetch error:", error);
        setErrMsg("Failed to fetch weather.");
      } finally {
        setLoading(false);
      }
    },
    [pushToForm, loading]
  );

  const fetchByAddress = useCallback(async () => {
    setErrMsg(null);
    const q = addressQuery;
    if (!q) return;

    setLoading(true);
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
      );
      const j = await geo.json();
      const first = j?.results?.[0];

      if (!first) {
        setErrMsg("Could not geocode address.");
        setLoading(false);
        return;
      }

      const lat = Number(first.latitude);
      const lon = Number(first.longitude);

      onField("lat", String(lat));
      onField("lon", String(lon));

      await fetchWeatherByCoords(lat, lon);
    } catch (error) {
      console.error("Geocoding error:", error);
      setErrMsg("Geocoding failed.");
      setLoading(false);
    }
  }, [addressQuery, fetchWeatherByCoords, onField]);

  useEffect(() => {
    if (!addressQuery) return;
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(fetchByAddress, 600);
    return () => {
      if (debTimer.current) clearTimeout(debTimer.current);
    };
  }, [addressQuery, fetchByAddress]);

  useEffect(() => {
    const lat = Number(form?.lat);
    const lon = Number(form?.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      fetchWeatherByCoords(lat, lon);
    }
  }, [form?.lat, form?.lon, fetchWeatherByCoords]);

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
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setErrMsg("Location permission denied.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchWeatherByCoords, onField]);

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
