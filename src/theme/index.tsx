// ─────────────────────────────────────────────────────────────────────────────
// Unified Color Tokens
// Combines:
// - Calendar theme tokens
// - Settings modal tokens
// - Lotus / uposatha indicators
// - Light + dark semantic surfaces
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_TOKENS = {
  // ── ACCENT / BRAND ───────────────────────────────────────────────────────
  accentBase:          'rgb(212 136 32)',
  accentMuted:         'rgb(212 136 32 / 0.15)',
  accentSubtle:        'rgb(212 136 32 / 0.08)',
  accentShadow:        'rgb(212 136 32 / 0.30)',
  accentText:          'rgb(212 136 32)',

  // ── LOTUS / ROSE ────────────────────────────────────────────────────────
  lotusBase:           'rgb(188 71 123)',
  lotusMuted:          'rgb(188 71 123 / 0.12)',
  lotusShadow:         'rgb(188 71 123 / 0.08)',

  darkLotusBase:       'rgb(240 120 160)',
  darkLotusMuted:      'rgb(240 120 160 / 0.12)',
  darkLotusShadow:     'rgb(240 120 160 / 0.08)',

  // ─────────────────────────────────────────────────────────────────────────
  // LIGHT MODE
  // warm cream + golden-brown
  // ─────────────────────────────────────────────────────────────────────────

  // Backgrounds
  lightBg:             'rgb(255 249 242)',
  lightSurface:        'rgb(255 255 255 / 0.92)',
  lightSurfaceHover:   'rgb(212 136 32 / 0.06)',
  lightCardBg:         'rgb(255 255 255 / 0.80)',
  lightSelectBg:       'rgb(255 249 242)',
  lightOverlay:        'rgb(0 0 0 / 0.35)',

  // Borders
  lightBorder:         'rgb(220 200 170 / 0.60)',
  lightInputBorder:    'rgb(210 190 160)',

  // Text
  lightTextPrimary:    'rgb(30 20 10)',
  lightTextSecondary:  'rgb(100 80 55)',
  lightTextMuted:      'rgb(150 120 80)',
  lightTextDisabled:   'rgb(190 170 140)',

  // Indicators
  lightTodayDot:       'rgb(212 136 32 / 0.40)',

  // ─────────────────────────────────────────────────────────────────────────
  // DARK MODE
  // near-black + saffron-gold
  // ─────────────────────────────────────────────────────────────────────────

  // Backgrounds
  darkBg:              'rgb(14 10 6)',
  darkSurface:         'rgb(24 17 8 / 0.95)',
  darkSurfaceHover:    'rgb(212 136 32 / 0.06)',
  darkCardBg:          'rgb(30 22 12 / 0.90)',
  darkSelectBg:        'rgb(24 17 8)',
  darkOverlay:         'rgb(0 0 0 / 0.55)',

  // Borders
  darkBorder:          'rgb(60 45 22)',
  darkInputBorder:     'rgb(60 45 22)',

  // Text
  darkTextPrimary:     'rgb(250 240 220)',
  darkTextSecondary:   'rgb(180 150 100)',
  darkTextMuted:       'rgb(120 100 65)',
  darkTextDisabled:    'rgb(80 65 40)',

  // Indicators
  darkTodayDot:        'rgb(212 136 32 / 0.35)',
};

const CSS_VARS = `
  :root {
    --sm-accent:           ${COLOR_TOKENS.accentBase};
    --sm-accent-muted:     ${COLOR_TOKENS.accentMuted};
    --sm-accent-subtle:    ${COLOR_TOKENS.accentSubtle};
    --sm-accent-shadow:    ${COLOR_TOKENS.accentShadow};

    --sm-bg:               ${COLOR_TOKENS.lightBg};
    --sm-surface:          ${COLOR_TOKENS.lightSurface};
    --sm-card-bg:          ${COLOR_TOKENS.lightCardBg};
    --sm-border:           ${COLOR_TOKENS.lightBorder};
    --sm-input-border:     ${COLOR_TOKENS.lightInputBorder};
    --sm-select-bg:        ${COLOR_TOKENS.lightSelectBg};

    --sm-text-primary:     ${COLOR_TOKENS.lightTextPrimary};
    --sm-text-secondary:   ${COLOR_TOKENS.lightTextSecondary};
    --sm-text-muted:       ${COLOR_TOKENS.lightTextMuted};
    --sm-text-disabled:    ${COLOR_TOKENS.lightTextDisabled};
    --sm-overlay:          ${COLOR_TOKENS.lightOverlay};
  }

  .dark {
    --sm-bg:               ${COLOR_TOKENS.darkBg};
    --sm-surface:          ${COLOR_TOKENS.darkSurface};
    --sm-card-bg:          ${COLOR_TOKENS.darkCardBg};
    --sm-border:           ${COLOR_TOKENS.darkBorder};
    --sm-input-border:     ${COLOR_TOKENS.darkInputBorder};
    --sm-select-bg:        ${COLOR_TOKENS.darkSelectBg};

    --sm-text-primary:     ${COLOR_TOKENS.darkTextPrimary};
    --sm-text-secondary:   ${COLOR_TOKENS.darkTextSecondary};
    --sm-text-muted:       ${COLOR_TOKENS.darkTextMuted};
    --sm-text-disabled:    ${COLOR_TOKENS.darkTextDisabled};
    --sm-overlay:          ${COLOR_TOKENS.darkOverlay};
  }
`;

export {COLOR_TOKENS, CSS_VARS}