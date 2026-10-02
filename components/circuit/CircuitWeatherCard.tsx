import { useLocale, useTranslations } from 'next-intl';
import { weatherSummary } from '@/lib/i18n/labels';
import type { CircuitWeather } from '@/lib/data/circuits';

export function CircuitWeatherCard({ weather }: { weather: CircuitWeather }) {
  const t = useTranslations('ui.circuit');
  const locale = useLocale();
  const isRain = weather.weatherCode >= 50 && weather.weatherCode <= 99;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="label-caps flex items-center gap-2 text-text-mid">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('weatherLive')}
        </span>
        <span className="label-caps rounded-full border border-white/10 bg-surface px-2.5 py-0.5 text-[10px] text-accent">
          {weather.isDay ? t('daySession') : t('nightSession')}
        </span>
      </div>

      <div className="my-4 flex items-baseline gap-4">
        <span className="hero-number text-[clamp(44px,6vw,68px)] text-text-hi leading-none">
          {weather.temperatureC}°C
        </span>
        <div className="flex flex-col">
          <span className="font-condensed text-lg font-700 uppercase tracking-wide text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {weatherSummary(weather.weatherCode, weather.summary, locale)}
          </span>
          {weather.apparentC != null ? (
            <span className="data-tabular text-xs text-text-mid">
              {t('feelsLike', { temp: weather.apparentC })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-hairline pt-3 font-mono text-xs">
        <div className="flex flex-col">
          <span className="label-caps text-[10px] text-text-low">{t('windSpeed')}</span>
          <span className="data-tabular text-sm font-semibold text-text">
            {weather.windKmh != null ? t('kmh', { value: weather.windKmh }) : t('calm')}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="label-caps text-[10px] text-text-low">{t('trackCondition')}</span>
          <span className={['data-tabular text-sm font-semibold', isRain ? 'text-blue-400' : 'text-emerald-400'].join(' ')}>
            {isRain ? t('wet') : t('dry')}
          </span>
        </div>
      </div>
    </div>
  );
}
