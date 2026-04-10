import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function ProgressBar({ progress = 0, showPercent = false, color, style = {} }) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  const c = color
    || (pct >= 75 ? COLORS.success
      : pct >= 40 ? COLORS.primary
      : COLORS.danger);

  return (
    <div style={{ marginTop: SPACING.xs, marginBottom: SPACING.xs, ...style }}>
      {showPercent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <span style={{ fontSize: FONTS.sizes.sm, fontWeight: '700', color: c }}>
            {pct}%
          </span>
        </div>
      )}

      {/* Track */}
      <div style={{
        width: '100%',
        height: 8,
        backgroundColor: COLORS.border || '#E2E8F0',
        borderRadius: RADIUS.full || 99,
        overflow: 'hidden',
      }}>
        {/* Fill */}
        <div style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: c,
          borderRadius: RADIUS.full || 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}