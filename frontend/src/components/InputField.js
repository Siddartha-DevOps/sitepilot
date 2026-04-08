import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  icon,
  editable = true,
  style,
}) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, error && styles.inputError, !editable && styles.inputDisabled]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && { height: numberOfLines * 40, textAlignVertical: 'top' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={isPassword && !showPwd}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />

        {isPassword && (
          <TouchableOpacity style={styles.iconRight} onPress={() => setShowPwd(v => !v)}>
            <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:        { marginBottom: SPACING.md },
  label:          { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  inputRow:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  inputError:     { borderColor: COLORS.danger },
  inputDisabled:  { backgroundColor: '#F1F5F9' },
  input:          { flex: 1, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
  inputWithIcon:  { paddingLeft: SPACING.xs },
  iconLeft:       { paddingLeft: SPACING.md },
  iconRight:      { paddingRight: SPACING.md },
  error:          { fontSize: FONTS.sizes.xs, color: COLORS.danger, marginTop: SPACING.xs },
});