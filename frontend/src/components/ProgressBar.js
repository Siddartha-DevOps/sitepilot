import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function ProgressBar({ progress=0, showPercent=true, color }) {
  const pct = Math.min(100, Math.max(0, progress));
  const c   = color||(pct>=75?COLORS.success:pct>=40?COLORS.warning:COLORS.primary);
  return (
    <View style={{ marginVertical:SPACING.xs }}>
      {showPercent && <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
        <View/><Text style={{ fontSize:FONTS.sizes.sm, fontWeight:'700', color:c }}>{pct}%</Text>
      </View>}
      <View style={styles.track}><View style={[styles.fill, { width:pct+'%', backgroundColor:c }]}/></View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height:8, backgroundColor:COLORS.border, borderRadius:RADIUS.full, overflow:'hidden' },
  fill:  { height:'100%', borderRadius:RADIUS.full },
});