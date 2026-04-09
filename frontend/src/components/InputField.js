import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType='default', multiline=false, numberOfLines=1, error, icon, editable=true, style }) {
  const [show, setShow] = useState(false);
  return (
    <View style={[{ marginBottom:SPACING.md }, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, error&&styles.rowErr, !editable&&styles.rowDis]}>
        {icon && <View style={{ paddingLeft:12 }}>{icon}</View>}
        <TextInput
          style={[styles.input, icon&&{ paddingLeft:6 }, multiline&&{ height:numberOfLines*40, textAlignVertical:'top' }]}
          value={value} onChangeText={onChangeText} placeholder={placeholder}
          placeholderTextColor={COLORS.textLight} secureTextEntry={secureTextEntry&&!show}
          keyboardType={keyboardType} multiline={multiline} editable={editable}
        />
        {secureTextEntry && <TouchableOpacity style={{ paddingRight:12 }} onPress={()=>setShow(v=>!v)}>
          <Ionicons name={show?'eye-off':'eye'} size={20} color={COLORS.textLight} />
        </TouchableOpacity>}
      </View>
      {error && <Text style={styles.err}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label:  { fontSize:FONTS.sizes.sm, fontWeight:'600', color:COLORS.secondary, marginBottom:4 },
  row:    { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderColor:COLORS.border, borderRadius:RADIUS.md, backgroundColor:'#fff' },
  rowErr: { borderColor:COLORS.danger },
  rowDis: { backgroundColor:'#F1F5F9' },
  input:  { flex:1, paddingVertical:10, paddingHorizontal:14, fontSize:FONTS.sizes.md, color:COLORS.text },
  err:    { fontSize:FONTS.sizes.xs, color:COLORS.danger, marginTop:4 },
});