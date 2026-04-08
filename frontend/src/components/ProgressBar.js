import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function ProgressBar({ progress = 0, label, showPercent = true, color }) {
  const pct    = Math.min(100, Math.max(0, progress));
  const barClr = color || (pct >= 75 ? COLORS.success : pct >= 40 ? COLORS.warning : COLORS.primary);

  return (
    <View style={styles.wrapper}>
      {(label || showPercent) && (
        <View style={styles.row}>
          {label      && <Text style={styles.label}>{label}</Text>}
          {showPercent && <Text style={[styles.pct, { color: barClr }]}>{pct}%</Text>}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barClr }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: SPACING.xs },
  row:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label:   { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  pct:     { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  track:   { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: RADIUS.full },
});