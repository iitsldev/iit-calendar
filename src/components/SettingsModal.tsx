import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, Loader2 } from 'lucide-react';
import { Settings, CalendarType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import {COLOR_TOKENS, CSS_VARS} from '../theme/index'

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00", "UTC-06:00", "UTC-05:00",
  "UTC-04:00", "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00",
  "UTC+04:00", "UTC+05:00", "UTC+05:30", "UTC+06:00", "UTC+06:30", "UTC+07:00", "UTC+08:00", "UTC+09:00",
  "UTC+10:00", "UTC+11:00", "UTC+12:00", "UTC+13:00", "UTC+14:00"
];


export function SettingsModal({ 
  show, 
  onClose, 
  settings, 
  onUpdate, 
  onGetLocation 
}: { 
  show: boolean; 
  onClose: () => void;
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onGetLocation: () => void;
}) {
  const { t } = useI18n();
  const [addressSearch, setAddressSearch] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async () => {
    if (!addressSearch.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        let timezone = settings.timezone;
        try {
          const tzRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const tzData = await tzRes.json();
          if (tzData.location && tzData.location.timezone) {}
        } catch (e) {}
        onUpdate({ ...settings, lat: parseFloat(lat), lng: parseFloat(lon), address: display_name });
        setAddressSearch('');
      } else {
        alert(t('settings.searchError'));
      }
    } catch (error) {
      alert("Error connecting to geocoding service.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <style>{CSS_VARS}</style>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-md"
        style={{ background: 'var(--sm-overlay)' }}
      >
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
          style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors"
            style={{ color: 'var(--sm-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--sm-accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--sm-text-muted)')}
          >
            <X size={24}/>
          </button>

          <h2
            className="font-serif text-2xl font-bold mb-8"
            style={{ color: 'var(--sm-accent)' }}
          >
            {t('common.settings')}
          </h2>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">

            {/* 1. Language & Script */}
            <section className="space-y-4">
              <SectionLabel>{t('common.language')} & {t('common.script')}</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label={t('settings.language')}>
                  <StyledSelect
                    value={settings.language}
                    onChange={e => onUpdate({ ...settings, language: e.target.value })}
                  >
                    <option value="en">English</option>
                  </StyledSelect>
                </FieldGroup>
                <FieldGroup label={t('settings.paliScript')}>
                  <StyledSelect
                    value={settings.paliScript}
                    onChange={e => onUpdate({ ...settings, paliScript: e.target.value as any })}
                  >
                    {(['roman', 'sinhala', 'burmese', 'thai'] as const).map(s => (
                      <option key={s} value={s}>{t(`settings.scripts.${s}`)}</option>
                    ))}
                  </StyledSelect>
                </FieldGroup>
              </div>
            </section>

            {/* 2. Location & Timezone */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: 'var(--sm-text-muted)' }} />
                  <SectionLabel inline>{t('settings.location')}</SectionLabel>
                </div>
                <button
                  onClick={onGetLocation}
                  className="text-[10px] font-bold hover:underline"
                  style={{ color: 'var(--sm-accent)' }}
                >
                  {t('settings.useCurrent')}
                </button>
              </div>

              <div className="space-y-4">
                {/* Address search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('settings.address')}
                    value={addressSearch}
                    onChange={e => setAddressSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-4 pr-12 py-4 rounded-2xl text-sm focus:outline-none transition-all"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--sm-input-border)',
                      color: 'var(--sm-text-primary)',
                      caretColor: 'var(--sm-accent)',
                    }}
                    onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px var(--sm-accent-muted)`)}
                    onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-2 bottom-2 px-3 rounded-xl text-white active:scale-95 transition-all"
                    style={{ background: 'var(--sm-accent)', boxShadow: 'var(--sm-accent-shadow)' }}
                  >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </div>

                {/* Current address display */}
                {settings.address && (
                  <div
                    className="px-4 py-3 rounded-2xl flex items-start gap-3"
                    style={{
                      background: 'var(--sm-accent-subtle)',
                      border: '1px solid var(--sm-accent-muted)',
                    }}
                  >
                    <MapPin size={14} className="mt-1 shrink-0" style={{ color: 'var(--sm-accent)' }} />
                    <div>
                      <p className="text-xs leading-tight font-medium" style={{ color: 'var(--sm-text-secondary)' }}>
                        {settings.address}
                      </p>
                      <p className="text-[9px] mt-1 font-mono" style={{ color: 'var(--sm-text-muted)' }}>
                        {settings.lat.toFixed(4)}°, {settings.lng.toFixed(4)}°
                      </p>
                    </div>
                  </div>
                )}

                {/* Timezone */}
                <FieldGroup label={t('settings.timezone')}>
                  <StyledSelect
                    value={settings.timezone}
                    onChange={e => onUpdate({ ...settings, timezone: e.target.value })}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </StyledSelect>
                </FieldGroup>

                {/* DST checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <button
                    onClick={() => onUpdate({ ...settings, dst: !settings.dst })}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                      style={{
                        background: settings.dst ? 'var(--sm-accent)' : 'transparent',
                        border: `1px solid ${settings.dst ? 'var(--sm-accent)' : 'var(--sm-input-border)'}`,
                      }}
                    >
                      {settings.dst && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--sm-text-muted)' }}
                    >
                      {t('settings.dst')}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Appearance */}
            <section className="space-y-4">
              <SectionLabel>{t('common.appearance')}</SectionLabel>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-1">
                {/* Theme color swatches */}
                <div className="flex gap-2">
                  {(['saffron', 'indigo', 'emerald', 'rose', 'slate'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => onUpdate({ ...settings, themeColor: color })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        color === 'saffron'  && "bg-saffron",
                        color === 'indigo'   && "bg-indigo-500",
                        color === 'emerald'  && "bg-emerald-500",
                        color === 'rose'     && "bg-rose-500",
                        color === 'slate'    && "bg-slate-700",
                      )}
                      style={{
                        border: settings.themeColor === color
                          ? '2px solid var(--sm-text-primary)'
                          : '2px solid var(--sm-border)',
                        transform: settings.themeColor === color ? 'scale(1.12)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                {/* Dark/Light toggle */}
                <button
                  onClick={() => onUpdate({ ...settings, darkMode: !settings.darkMode })}
                  className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  style={settings.darkMode
                    ? { background: 'var(--sm-accent)', color: 'rgb(20 14 6)' }
                    : { background: 'var(--sm-text-primary)', color: 'rgb(255 249 242)' }
                  }
                >
                  {settings.darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </section>

            {/* 4. Tradition & Calculation */}
            <section className="space-y-4 pb-4">
              <SectionLabel>{t('settings.tradition')}</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {(['myanmar', 'thai', 'srilanka', 'lunar'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => onUpdate({ ...settings, calendarType: type })}
                    className="px-4 py-3 rounded-2xl text-xs font-bold capitalize transition-all"
                    style={settings.calendarType === type
                      ? { background: 'var(--sm-accent)', color: 'white', border: '1px solid var(--sm-accent)', boxShadow: `0 4px 16px var(--sm-accent-shadow)` }
                      : { background: 'transparent', border: '1px solid var(--sm-input-border)', color: 'var(--sm-text-secondary)' }
                    }
                  >
                    {type === 'srilanka' ? t('calendar.srilanka') : type}
                  </button>
                ))}
              </div>

              <SectionLabel centered>{t('settings.dawnCalculation')}</SectionLabel>
              <div className="flex flex-col gap-2">
                {['astrology', 'pa-auk', 'nauyana'].map(m => (
                  <button
                    key={m}
                    onClick={() => onUpdate({ ...settings, dawnMethod: m })}
                    className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center transition-all"
                    style={settings.dawnMethod === m
                      ? { background: 'var(--sm-accent)', color: 'white', border: '1px solid var(--sm-accent)', boxShadow: `0 4px 16px var(--sm-accent-shadow)` }
                      : { background: 'transparent', border: '1px solid var(--sm-input-border)', color: 'var(--sm-text-muted)' }
                    }
                  >
                    <span>{t(`settings.dawnMethods.${m}`)}</span>
                    {settings.dawnMethod === m && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Confirm */}
            <button
              onClick={onClose}
              className="w-full py-4 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-[0.98] transition-all"
              style={{ background: 'var(--sm-text-primary)', color: 'var(--sm-bg)' }}
            >
              {t('common.confirm')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children, inline, centered }: { children: React.ReactNode; inline?: boolean; centered?: boolean }) {
  return (
    <h3
      className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        !inline && "px-1",
        centered && "text-center pt-2",
      )}
      style={{ color: 'var(--sm-text-muted)' }}
    >
      {children}
    </h3>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        className="text-[9px] font-bold uppercase ml-1 block"
        style={{ color: 'var(--sm-text-muted)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledSelect({ value, onChange, children }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none appearance-none"
      style={{
        background: 'var(--sm-select-bg)',
        border: '1px solid var(--sm-input-border)',
        color: 'var(--sm-text-primary)',
      }}
    >
      {children}
    </select>
  );
}