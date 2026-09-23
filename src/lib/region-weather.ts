import { useEffect, useState } from "react";
import type { WeatherRegion } from "@/lib/api";

export function useRegionWeather(place: WeatherRegion | null): number | null {
  const [celsius, setCelsius] = useState<number | null>(place?.celsius ?? null);

  useEffect(() => {
    if (!place) {
      setCelsius(null);
      return;
    }

    if (typeof place.celsius === "number") {
      setCelsius(place.celsius);
      return;
    }

    let cancelled = false;
    setCelsius(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m`;
    void fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { current?: { temperature_2m?: number } } | null) => {
        if (cancelled) return;
        const value = json?.current?.temperature_2m;
        if (typeof value === "number") setCelsius(Math.round(value));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [place?.key, place?.latitude, place?.longitude, place?.celsius]);

  return celsius;
}
