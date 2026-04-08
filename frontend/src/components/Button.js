import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, View,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',   // primary | secondary | outline | danger | ghost
  size    = 'md',        // sm | md | lg
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  const vs = variantStyles[variant] || variantStyles.primary;
  const ss = sizeStyles[size]       || sizeStyles.md;

  return (
    <TouchableOpacity
      style={[styles.base, vs.btn, ss.btn, disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={vs.text.color} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, vs.text, ss.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:     { borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  row:      { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: SPACING.xs },
  text:     { fontWeight: '700' },
});

const variantStyles = {
  primary:   { btn: { backgroundColor: COLORS.primary },  text: { color: COLORS.textWhite } },
  secondary: { btn: { backgroundColor: COLORS.secondary }, text: { color: COLORS.textWhite } },
  outline:   { btn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary }, text: { color: COLORS.primary } },
  danger:    { btn: { backgroundColor: COLORS.danger },    text: { color: COLORS.textWhite } },
  ghost:     { btn: { backgroundColor: 'transparent' },    text: { color: COLORS.primary } },
};

const sizeStyles = {
  sm: { btn: { paddingVertical: SPACING.xs,  paddingHorizontal: SPACING.md }, text: { fontSize: FONTS.sizes.sm } },
  md: { btn: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg }, text: { fontSize: FONTS.sizes.md } },
  lg: { btn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl  }, text: { fontSize: FONTS.sizes.lg } },
};