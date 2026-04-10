import React from 'react';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

const V = {
  primary:   { btn: { backgroundColor: COLORS.primary },                                          text: { color: '#fff' } },
  secondary: { btn: { backgroundColor: COLORS.secondary },                                        text: { color: '#fff' } },
  outline:   { btn: { backgroundColor: 'transparent', border: `2px solid ${COLORS.primary}` },   text: { color: COLORS.primary } },
  danger:    { btn: { backgroundColor: COLORS.danger || '#e53e3e' },                              text: { color: '#fff' } },
  ghost:     { btn: { backgroundColor: 'transparent', border: 'none' },                          text: { color: COLORS.primary } },
};

const S = {
  sm: { btn: { padding: '6px 14px'  }, text: { fontSize: FONTS.sizes.sm } },
  md: { btn: { padding: '12px 20px' }, text: { fontSize: FONTS.sizes.md } },
  lg: { btn: { padding: '15px 24px' }, text: { fontSize: FONTS.sizes.lg } },
};

export default function Button({
  label,
  title,          // alias — works with either prop name
  onClick,
  onPress,        // alias — works with either prop name
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style = {},
}) {
  const vs = V[variant] || V.primary;
  const ss = S[size]    || S.md;

  const isDisabled = disabled || loading;
  const displayLabel = label || title || '';

  return (
    <button
      onClick={onClick || onPress}
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.md,
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.45 : 1,
        fontFamily: 'inherit',
        fontWeight: '700',
        transition: 'opacity 0.2s',
        width: '100%',
        ...vs.btn,
        ...ss.btn,
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          width: 18, height: 18,
          border: `2px solid ${vs.text.color}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          <span style={{ ...vs.text, ...ss.text, fontWeight: '700' }}>{displayLabel}</span>
        </span>
      )}

      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}