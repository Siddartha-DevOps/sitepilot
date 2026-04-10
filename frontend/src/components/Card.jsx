import React from 'react';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const SHADOW = {
  sm: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  md: { boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
  lg: { boxShadow: '0 8px 24px rgba(0,0,0,0.16)' },
};

export default function Card({ children, style = {}, shadow = 'sm' }) {
  return (
    <div style={{
      backgroundColor: COLORS.surface || '#fff',
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...(SHADOW[shadow] || SHADOW.sm),
      ...style,
    }}>
      {children}
    </div>
  );
}