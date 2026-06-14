export const colors = {
  // Brand
  primary: '#FF6B6B',       // Coral/Orange — energetic, friendly
  secondary: '#4ECDC4',     // Teal — calm, social
  accent: '#FFE66D',        // Sunny Yellow — fun, highlights

  // Neutrals
  dark: '#2D3142',          // Charcoal
  slate: '#4F5D75',         // Medium grey
  muted: '#9BA3B2',         // Subdued text
  border: '#E2E8F0',        // Borders
  surface: '#FFFFFF',       // Card backgrounds
  background: '#F7F9FB',    // App background

  // Semantic
  success: '#6BCF7F',
  warning: '#FFB347',
  error: '#FF6B6B',         // Same as primary intentionally

  // Text
  textPrimary: '#2D3142',
  textSecondary: '#4F5D75',
  textMuted: '#9BA3B2',
  textInverse: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
