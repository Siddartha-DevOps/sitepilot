import React, { useState } from 'react';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function InputField({
  label,
  value,
  onChange,
  onChangeText,   // kept for backward-compat — maps to onChange
  placeholder,
  secureTextEntry,
  type = 'text',
  multiline = false,
  rows = 3,
  error,
  icon,
  disabled = false,
  style = {},
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Support both web onChange and RN-style onChangeText
  function handleChange(e) {
    if (onChange) onChange(e);
    if (onChangeText) onChangeText(e.target.value);
  }

  const inputType = secureTextEntry ? (showPassword ? 'text' : 'password') : type;

  const borderColor = error ? (COLORS.danger || '#e53e3e') : COLORS.border;

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    border: `1.5px solid ${borderColor}`,
    borderRadius: RADIUS.md,
    backgroundColor: disabled ? '#F1F5F9' : (COLORS.surface || '#fff'),
    overflow: 'hidden',
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    paddingLeft: icon ? 6 : 14,
    fontSize: FONTS.sizes.md,
    color: disabled ? COLORS.textLight : COLORS.text,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: SPACING.md, ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: FONTS.sizes.sm,
          fontWeight: '600',
          color: COLORS.secondary,
          marginBottom: 4,
        }}>
          {label}
        </label>
      )}

      <div style={rowStyle}>
        {icon && (
          <div style={{ paddingLeft: 12, display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}

        {multiline ? (
          <textarea
            style={inputStyle}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
          />
        ) : (
          <input
            style={inputStyle}
            type={inputType}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {secureTextEntry && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              paddingRight: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword
              ? <IoEyeOffOutline size={20} color={COLORS.textLight} />
              : <IoEyeOutline    size={20} color={COLORS.textLight} />
            }
          </button>
        )}
      </div>

      {error && (
        <span style={{
          fontSize: FONTS.sizes.xs,
          color: COLORS.danger || '#e53e3e',
          marginTop: 4,
          display: 'block',
        }}>
          {error}
        </span>
      )}
    </div>
  );
}