import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, Loader2, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { Settings } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import { auth, signInWithGoogle } from '../lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

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
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Sign in failed:", error);
      setLoginError(error.message || "Authentication failed. Check if your domain is authorized in Firebase Console.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleSearch = async () => {
    if (!addressSearch.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
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
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.45)' }}
      >
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="glass-card w-full max-w-lg rounded-[2.5rem] px-2 py-4 shadow-2xl relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent)')}
          >
            <X size="1.5em"/>
          </button>

          <h2
            className="font-serif text-3xl font-bold mb-6 ml-4"
            style={{ color: 'var(--accent)' }}
          >
            {t('common.settings')}
          </h2>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">

            {/* 0. Account Section */}
            <section className="space-y-4">
              <SectionLabel>Account</SectionLabel>
              <div
                className="rounded-[1.5rem] p-5 border"
                style={{ backgroundColor: 'var(--bg-card-alt)', borderColor: 'var(--border-subtle)' }}
              >
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-12 h-12 rounded-full"
                            style={{ border: '1px solid var(--border-base)' }}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--accent)' }}
                          >
                            <UserIcon size={24} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {user.displayName || 'Practitioner'}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-widest"
                            style={{ color: 'var(--accent)' }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="p-3 rounded-2xl transition-colors text-rose-500"
                        style={{ backgroundColor: 'rgba(244,63,94,0.07)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.14)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.07)')}
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                    <div
                      className="border-t pt-4 flex justify-between items-center w-full"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                        Sync Data to Cloud
                      </span>
                      <Toggle
                        value={settings.syncToFirebase}
                        onToggle={() => onUpdate({ ...settings, syncToFirebase: !settings.syncToFirebase })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-2">
                    <p className="text-xs px-4" style={{ color: 'var(--accent)' }}>
                      Sign in to sync your chanting progress and meditation stats across devices.
                    </p>
                    {loginError && (
                      <div
                        className="mx-4 p-3 rounded-xl text-[10px] font-medium leading-relaxed border text-rose-500"
                        style={{ backgroundColor: 'rgba(244,63,94,0.06)', borderColor: 'rgba(244,63,94,0.15)' }}
                      >
                        {loginError}
                        <p className="mt-2 text-[9px] opacity-70">
                          Tip: In AI Studio, you must add the App URL to "Authorized Domains" in Firebase Authentication settings.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleSignIn}
                      className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        boxShadow: '0 8px 20px var(--accent-ring)',
                      }}
                    >
                      <LogIn size={16} />
                      Sign in with Google
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 1. Language & Script */}
            <section className="space-y-4">
              <SectionLabel>{t('common.language')} & {t('common.script')}</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label={t('settings.language')}>
                  <StyledSelect
                    value={settings.language}
                    onChange={e => onUpdate({ ...settings, language: e.target.value })}
                  >
                    {(['en', 'vi', 'th', 'si', 'my', 'km', 'lo'] as const).map(lang => (
                      <option key={`lang-opt-${lang}`} value={lang}>{t(`settings.languages.${lang}`)}</option>
                    ))}
                  </StyledSelect>
                </FieldGroup>
                <FieldGroup label={t('settings.paliScript')}>
                  <StyledSelect
                    value={settings.paliScript}
                    onChange={e => onUpdate({ ...settings, paliScript: e.target.value as any })}
                  >
                    {(['roman', 'sinhala', 'burmese', 'thai'] as const).map(s => (
                      <option key={`script-opt-${s}`} value={s}>{t(`settings.scripts.${s}`)}</option>
                    ))}
                  </StyledSelect>
                </FieldGroup>
              </div>
            </section>

            {/* 1.5 Font Size */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <SectionLabel>Font Size</SectionLabel>
                <span className="text-sm font-bold opacity-60" style={{ color: 'var(--text-primary)' }}>
                  {settings.fontSize}px
                </span>
              </div>
              <div className="px-1">
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdate({ ...settings, fontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)', backgroundColor: 'var(--bg-muted)' }}
                />
                <div
                  className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--accent)' }}
                >
                  <span>Small</span>
                  <span>Normal</span>
                  <span>Large</span>
                </div>
              </div>
            </section>

            {/* 2. Location & Timezone */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MapPin size="1em" style={{ color: 'var(--accent)' }} />
                  <SectionLabel inline>{t('settings.location')}</SectionLabel>
                </div>
                <button
                  className="text-sm font-bold hover:underline"
                  style={{ color: 'var(--accent)' }}
                  onClick={onGetLocation}
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
                    className="w-full pl-4 pr-12 py-4 rounded-2xl text-base focus:outline-none transition-all bg-transparent"
                    style={{
                      border: '1px solid var(--border-base)',
                      color: 'var(--text-primary)',
                      caretColor: 'var(--accent)',
                    }}
                    onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-ring)')}
                    onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-2 bottom-2 px-3 rounded-xl text-white active:scale-95 transition-all"
                    style={{
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 4px 12px var(--accent-ring)',
                    }}
                  >
                    {isSearching ? <Loader2 size="1.2em" className="animate-spin" /> : <Search size="1.2em" />}
                  </button>
                </div>

                {/* Current address display */}
                {settings.address && (
                  <div
                    className="px-4 py-3 rounded-2xl flex items-start gap-3"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-ring)',
                    }}
                  >
                    <MapPin size="1.1em" className="mt-1 shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="text-sm leading-tight font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {settings.address}
                      </p>
                      <p className="text-sm mt-1 font-mono" style={{ color: 'var(--accent)' }}>
                        {settings.lat.toFixed(4)}°, {settings.lng.toFixed(4)}°
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Appearance */}
            <section className="space-y-4">
              <SectionLabel>{t('common.appearance')}</SectionLabel>
              <div className="flex flex-col gap-4 px-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                    Solar Noon Bell
                  </span>
                  <Toggle
                    value={settings.solarNoonBell}
                    onToggle={() => onUpdate({ ...settings, solarNoonBell: !settings.solarNoonBell })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  {/* Theme color swatches */}
                  <div className="flex gap-2">
                    {(['saffron', 'indigo', 'emerald', 'rose', 'slate'] as const).map(color => (
                      <button
                        key={`theme-opt-${color}`}
                        onClick={() => onUpdate({ ...settings, themeColor: color })}
                        style={{
                          transform: settings.themeColor === color ? 'scale(1.12)' : 'scale(1)',
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          color === 'saffron'  && "bg-[#7f5700]",
                          color === 'indigo'   && "bg-indigo-500",
                          color === 'emerald'  && "bg-emerald-500",
                          color === 'rose'     && "bg-rose-500",
                          color === 'slate'    && "bg-slate-700",
                          settings.themeColor === color
                            ? "ring-2 ring-offset-1 ring-[var(--text-primary)]"
                            : "ring-2 ring-[var(--border-subtle)]"
                        )}
                      />
                    ))}
                  </div>

                  {/* Dark/Light toggle */}
                  <button
                    onClick={() => onUpdate({ ...settings, darkMode: !settings.darkMode })}
                    className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-main)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {settings.darkMode ? "☀ Light Mode" : "☾ Dark Mode"}
                  </button>
                </div>
              </div>
            </section>

            {/* 4. Tradition & Calculation */}
            <section className="space-y-4 pb-4">
              <SectionLabel>{t('settings.tradition')}</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {(['myanmar', 'thai', 'srilanka', 'lunar'] as const).map(type => (
                  <button
                    key={`cal-type-opt-${type}`}
                    onClick={() => onUpdate({ ...settings, calendarType: type })}
                    className="px-4 py-3 rounded-2xl text-xs font-bold capitalize transition-all"
                    style={
                      settings.calendarType === type
                        ? {
                            backgroundColor: 'var(--accent)',
                            color: '#fff',
                            border: '1px solid var(--accent)',
                            boxShadow: '0 4px 16px var(--accent-ring)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-base)',
                          }
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
                    key={`dawn-opt-${m}`}
                    onClick={() => onUpdate({ ...settings, dawnMethod: m })}
                    className="px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex justify-between items-center transition-all"
                    style={
                      settings.dawnMethod === m
                        ? {
                            backgroundColor: 'var(--accent)',
                            color: '#fff',
                            border: '1px solid var(--accent)',
                            boxShadow: '0 4px 16px var(--accent-ring)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--text-saffron)',
                            border: '1px solid var(--border-base)',
                          }
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
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-main)',
              }}
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
        "text-sm font-black uppercase tracking-widest",
        !inline && "px-1",
        centered && "text-center pt-2",
      )}
      style={{ color: 'var(--accent)' }}
    >
      {children}
    </h3>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-bold uppercase ml-1 block"
        style={{ color: 'var(--accent)' }}
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
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-base)',
        color: 'var(--text-primary)',
      }}
    >
      {children}
    </select>
  );
}

/** Reusable toggle switch driven entirely by CSS variables */
function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-12 h-6 rounded-full relative transition-colors"
      style={{ backgroundColor: value ? 'var(--accent)' : 'var(--bg-muted)' }}
    >
      <motion.div
        animate={{ x: value ? 24 : 4 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}