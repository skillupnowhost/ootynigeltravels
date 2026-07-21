const OOTY_LAT = 11.4102;
const OOTY_LNG = 76.695;

export type SkyCondition = "clear" | "cloudy" | "fog" | "rain" | "storm";

export interface HeroTheme {
  timeOfDay: "day" | "night";
  sky: SkyCondition;
  /** 0 = new moon, 1 = full moon. Only meaningful at night. */
  moonIllumination: number;
  temperatureC: number | null;
  /** True only when the forecast API itself failed/was unreachable — not just when the reading is a normal clear day. */
  unavailable: boolean;
}

const FALLBACK_THEME: HeroTheme = {
  timeOfDay: "day",
  sky: "clear",
  moonIllumination: 0.4,
  temperatureC: null,
  unavailable: true,
};

function codeToSky(code: number): SkyCondition {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([45, 48].includes(code)) return "fog";
  if ([1, 2, 3, 71, 73, 75, 77, 85, 86].includes(code)) return "cloudy";
  return "clear";
}

/** Fractional illumination of the moon (0 = new, 1 = full) via a simple synodic-month approximation. */
function getMoonIllumination(date: Date): number {
  const synodicMonth = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const daysSince = (date.getTime() - knownNewMoon) / 86_400_000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const fraction = phase / synodicMonth;
  return (1 - Math.cos(2 * Math.PI * fraction)) / 2;
}

/** Live Ooty weather → hero visual theme. Falls back to a clear-day look if the forecast API is unreachable. */
export async function getOotyWeather(): Promise<HeroTheme> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${OOTY_LAT}&longitude=${OOTY_LNG}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return FALLBACK_THEME;

    const data = await res.json();
    const code = Number(data?.current?.weather_code);
    const isDay = data?.current?.is_day === 1;
    const temperatureC = typeof data?.current?.temperature_2m === "number" ? data.current.temperature_2m : null;

    return {
      timeOfDay: isDay ? "day" : "night",
      sky: Number.isFinite(code) ? codeToSky(code) : "clear",
      moonIllumination: getMoonIllumination(new Date()),
      temperatureC,
      unavailable: false,
    };
  } catch {
    return FALLBACK_THEME;
  }
}
