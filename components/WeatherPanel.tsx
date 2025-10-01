"use client";
import { useEffect } from "react";

export type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
};

type Props = {
  form: any;
  onField: (key: any, v: string)=>void;
  onFetched: (w: WeatherData)=>void;
  rating?: React.ReactNode;  
};

export default function WeatherPanel({ form, onField, onFetched, rating }: Props){
  const iconMap: Record<string,string> = {Sunny:'☀️','Partly Cloudy':'⛅',Cloudy:'☁️',Overcast:'🌫️','Light Rain':'🌦️','Heavy Rain':'🌧️',Foggy:'🌫️',Windy:'💨',Storm:'⛈️'};
  const feels = form.temperature && form.humidity
    ? String(Math.round(parseInt(form.temperature) - (100 - parseInt(form.humidity))/25))
    : '';

  useEffect(()=>{
    // Simulated weather fetch
    const w: WeatherData = {
      temperature: Math.round(Math.random()*30+5),
      humidity: Math.round(Math.random()*50+30),
      windSpeed: Math.round(Math.random()*20+5),
      description: ['Sunny','Partly Cloudy','Cloudy','Light Rain','Overcast'][Math.floor(Math.random()*5)]
    };
    onFetched(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <div className="form-section bg-white rounded-xl p-6 shadow-sm fade-in">
      <h2 className="text-xl font-semibold text-kiwi-dark mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-kiwi-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
        Weather Conditions
      </h2>

      <div className="weather-card rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl">{iconMap[form.weatherDescription] || '🌤️'}</span>
            <span className="text-lg font-semibold text-blue-800 ml-2">{form.weatherDescription || 'Select weather'}</span>
          </div>
          <span className="text-sm text-blue-700">{form.temperature ? `${form.temperature}°C` : '--°C'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-blue-800">
          <div>Humidity: <span>{form.humidity ? `${form.humidity}%` : '--%'}</span></div>
          <div>Wind: <span>{form.windSpeed ? `${form.windSpeed} km/h` : '-- km/h'}</span></div>
          <div>Feels: <span>{feels ? `${feels}°C` : '--°C'}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>{rating}</div>

        <div>
          <label className="block text-sm mb-2" htmlFor="temperature">Temperature (°C)</label>
          <input id="temperature" type="number"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            value={form.temperature} onChange={(e)=>onField('temperature', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="humidity">Humidity (%)</label>
          <input id="humidity" type="number" max={100}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            value={form.humidity} onChange={(e)=>onField('humidity', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="windSpeed">Wind (km/h)</label>
          <input id="windSpeed" type="number"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            value={form.windSpeed} onChange={(e)=>onField('windSpeed', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-2" htmlFor="weatherDescription">Weather</label>
          <select id="weatherDescription"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kiwi-green"
            value={form.weatherDescription}
            onChange={(e)=>onField('weatherDescription', e.target.value)}
          >
            <option value="">Select…</option>
            {['Sunny','Partly Cloudy','Cloudy','Overcast','Light Rain','Heavy Rain','Foggy','Windy','Storm'].map(o=>
              <option key={o} value={o}>{o}</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
