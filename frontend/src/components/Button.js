import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function Button({ title, onPress, variant='primary', size='md', loading=false, disabled=false, icon, style }) {
  const vs = V[variant]||V.primary;
  const ss = S[size]||S.md;
  return (
    <TouchableOpacity style={[styles.base, vs.btn, ss.btn, disabled&&styles.disabled, style]} onPress={onPress} activeOpacity={0.75} disabled={disabled||loading}>
      {loading ? <ActivityIndicator color={vs.text.color} size="small" />
               : <View style={styles.row}>{icon&&<View style={{marginRight:6}}>{icon}</View>}<Text style={[styles.text, vs.text, ss.text]}>{title}</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:     { borderRadius:RADIUS.md, alignItems:'center', justifyContent:'center' },
  disabled: { opacity:0.45 },
  row:      { flexDirection:'row', alignItems:'center' },
  text:     { fontWeight:'700' },
});
const V = {
  primary:   { btn:{ backgroundColor:COLORS.primary },  text:{ color:'#fff' } },
  secondary: { btn:{ backgroundColor:COLORS.secondary }, text:{ color:'#fff' } },
  outline:   { btn:{ backgroundColor:'transparent', borderWidth:2, borderColor:COLORS.primary }, text:{ color:COLORS.primary } },
  danger:    { btn:{ backgroundColor:COLORS.danger },    text:{ color:'#fff' } },
  ghost:     { btn:{ backgroundColor:'transparent' },    text:{ color:COLORS.primary } },
};
const S = {
  sm: { btn:{ paddingVertical:6,  paddingHorizontal:14 }, text:{ fontSize:FONTS.sizes.sm } },
  md: { btn:{ paddingVertical:12, paddingHorizontal:20 }, text:{ fontSize:FONTS.sizes.md } },
  lg: { btn:{ paddingVertical:15, paddingHorizontal:24 }, text:{ fontSize:FONTS.sizes.lg } },
};