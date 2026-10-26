export const colors = {
  background: '#0B0F19',
  surface: '#111827',
  surfaceElevated: '#1F2937',
  surfaceHighlight: '#374151',
  border: '#1F2937',
  borderSubtle: '#1E293B',
  borderFocus: '#6366F1',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primaryText: '#FFFFFF',
  secondary: '#374151',
  secondaryText: '#F3F4F6',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.3)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  successBorder: 'rgba(16, 185, 129, 0.3)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.12)',
  infoBorder: 'rgba(59, 130, 246, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  titleLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  bodyRegular: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
};
