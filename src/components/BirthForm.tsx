'use client';
import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import citiesData from '@/lib/data/cities.json';
import { Field, inputClass } from './ui/Field';
import { Button } from './ui/Button';
import type { BirthInput } from '@/lib/bazi/types';

interface City {
  name: string;
  province: string;
  lng: number;
  lat: number;
  tz: number;
}
const cities = citiesData as City[];

export function BirthForm({
  onSubmit,
  loading,
}: {
  onSubmit: (input: BirthInput) => void;
  loading?: boolean;
}) {
  const now = new Date();
  const [date, setDate] = useState(`${now.getFullYear() - 25}-06-15`);
  const [time, setTime] = useState('14:30');
  const [gender, setGender] = useState<1 | 0>(1);
  const [cityQuery, setCityQuery] = useState('北京');
  const [city, setCity] = useState<City>(cities[0]);

  const matches = useMemo(() => {
    const q = cityQuery.trim();
    if (!q) return [];
    return cities.filter((c) => c.name.startsWith(q) || c.province.startsWith(q)).slice(0, 6);
  }, [cityQuery]);

  const showList = cityQuery !== city.name && matches.length > 0;

  const handleSubmit = () => {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    onSubmit({
      year: y,
      month: m,
      day: d,
      hour: hh,
      minute: mm,
      gender,
      city: city.name,
      longitude: city.lng,
      latitude: city.lat,
      tzOffsetHours: city.tz,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="出生日期（阳历）">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="出生时间">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="性别">
        <div className="grid grid-cols-2 gap-3">
          {([1, 0] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                gender === g
                  ? 'border-gold bg-gold/15 text-gold-light'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {g === 1 ? '乾造（男）' : '坤造（女）'}
            </button>
          ))}
        </div>
      </Field>

      <div className="relative">
        <Field label="出生城市（用于真太阳时校正）">
          <input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="输入城市名，如 上海"
            className={inputClass}
          />
        </Field>
        {showList && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-xl">
            {matches.map((c) => (
              <li key={`${c.province}-${c.name}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCity(c);
                    setCityQuery(c.name);
                  }}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm hover:bg-gold/10"
                >
                  <span className="text-gray-100">{c.name}</span>
                  <span className="text-xs text-gray-500">
                    {c.province} · {c.lng.toFixed(1)}°E
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        <Sparkles size={16} />
        {loading ? '正在排盘…' : '开始排盘'}
      </Button>
    </div>
  );
}
