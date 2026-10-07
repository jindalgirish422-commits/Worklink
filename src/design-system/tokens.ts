/**
 * WorkLink Design System Tokens
 * 
 * Philosophy: Minimalist, spacious, sophisticated, calm, technologically advanced, human.
 * Palette inspiration: Pure materials, refined neutrals, restrained precision sapphire accent.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#FBFBFD',
    surfaceTertiary: '#F0F0F2',
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(255, 255, 255, 0.88)',

    // Typography
    textPrimary: '#111111',
    textSecondary: '#6E6E73',
    textMuted: '#86868B',
    textInverse: '#FFFFFF',

    // WorkLink Restrained Accent (Precision Cobalt / Sapphire)
    accent: '#0071E3',
    accentHover: '#0077ED',
    accentActive: '#0062C4',
    accentSubtle: 'rgba(0, 113, 227, 0.08)',
    accentBorder: 'rgba(0, 113, 227, 0.24)',

    // Semantic States
    success: '#34C759',
    successSubtle: 'rgba(52, 199, 89, 0.10)',
    successBorder: 'rgba(52, 199, 89, 0.24)',
    successText: '#1B8738',

    warning: '#FF9500',
    warningSubtle: 'rgba(255, 149, 0, 0.10)',
    warningBorder: 'rgba(255, 149, 0, 0.24)',
    warningText: '#B25E00',

    danger: '#FF3B30',
    dangerSubtle: 'rgba(255, 59, 48, 0.08)',
    dangerBorder: 'rgba(255, 59, 48, 0.22)',
    dangerText: '#D70015',

    // Borders & Dividers
    border: 'rgba(0, 0, 0, 0.08)',
    borderSubtle: 'rgba(0, 0, 0, 0.04)',
    borderStrong: 'rgba(0, 0, 0, 0.16)',
    borderFocus: '#0071E3',
  },

  typography: {
    fontSans:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontMono:
      '"SF Mono", "JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace',

    scales: {
      hero: {
        fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
        lineHeight: '1.05',
        letterSpacing: '-0.035em',
        fontWeight: '700',
      },
      heading1: {
        fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
        lineHeight: '1.15',
        letterSpacing: '-0.025em',
        fontWeight: '700',
      },
      heading2: {
        fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
        lineHeight: '1.25',
        letterSpacing: '-0.02em',
        fontWeight: '600',
      },
      heading3: {
        fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
        lineHeight: '1.3',
        letterSpacing: '-0.015em',
        fontWeight: '600',
      },
      subheading: {
        fontSize: '1.125rem',
        lineHeight: '1.45',
        letterSpacing: '-0.01em',
        fontWeight: '400',
      },
      body: {
        fontSize: '0.9375rem',
        lineHeight: '1.55',
        letterSpacing: '-0.008em',
        fontWeight: '400',
      },
      bodySmall: {
        fontSize: '0.8125rem',
        lineHeight: '1.5',
        letterSpacing: '-0.005em',
        fontWeight: '400',
      },
      metadata: {
        fontSize: '0.75rem',
        lineHeight: '1.4',
        letterSpacing: '0',
        fontWeight: '500',
      },
      label: {
        fontSize: '0.6875rem',
        lineHeight: '1.2',
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        fontWeight: '600',
      },
    },
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '28px',
    full: '9999px',
  },

  shadows: {
    subtle: '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
    cardHover: '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
    float: '0 20px 48px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
    glowAccent: '0 0 24px -4px rgba(0, 113, 227, 0.25)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '240ms cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: '360ms cubic-bezier(0.16, 1, 0.3, 1)',
    spring: '450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',
    '2xl': '1360px',
    full: '100%',
  },

  // Premium Liquid Glass Material System
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.65)',
      backdropBlur: '16px',
      saturate: '130%',
      border: 'rgba(255, 255, 255, 0.45)',
      shadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
      specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropBlur: '24px',
      saturate: '140%',
      border: 'rgba(255, 255, 255, 0.55)',
      shadow: '0 12px 36px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
      specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.65)',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropBlur: '32px',
      saturate: '150%',
      border: 'rgba(255, 255, 255, 0.70)',
      shadow: '0 20px 50px -8px rgba(0, 0, 0, 0.09), 0 8px 20px -4px rgba(0, 0, 0, 0.04)',
      specular: 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.85)',
    },
    dark: {
      background: 'rgba(17, 17, 17, 0.78)',
      backdropBlur: '24px',
      saturate: '140%',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 16px 40px -4px rgba(0, 0, 0, 0.25)',
      specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)',
    },
    accent: {
      background: 'rgba(0, 113, 227, 0.06)',
      backdropBlur: '20px',
      saturate: '130%',
      border: 'rgba(0, 113, 227, 0.20)',
      shadow: '0 8px 24px -4px rgba(0, 113, 227, 0.12)',
      specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
    },
  },
} as const;

export type DesignTokens = typeof tokens;
