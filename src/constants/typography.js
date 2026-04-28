import { COLORS } from './colors';

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  h4: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  body1: { fontSize: 16, fontWeight: '400', color: COLORS.textPrimary },
  body2: { fontSize: 14, fontWeight: '400', color: COLORS.textSecondary },
  caption: { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
};
