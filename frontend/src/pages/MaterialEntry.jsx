import React, { useState } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

// Icon Imports (using react-icons)
import { IoArrowBack, IoBriefcaseOutline, IoCubeOutline, IoBusinessOutline } from 'react-icons/io5';
import { IoCalendarOutline, IoReceiptOutline, IoCreateOutline, IoSave, IoCube, IoCalendar, IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const PROJECTS = ['Highway NH-44 Widening', 'Commercial Complex Block A', 'Residential Colony Phase 2', 'Water Treatment Plant Ext.'];
const MATERIALS = ['Cement (OPC 53)', 'TMT Steel Bars', 'River Sand', 'Coarse Aggregate', 'Bricks (Class A)', 'Fly Ash', 'Plywood Sheets', 'PVC Pipes', 'Electrical Cables'];
const UNITS = ['Bags', 'Tonnes', 'Cft', 'Nos', 'Kg', 'Litres', 'Meters', 'Sqft', 'Rmt'];

export default function MaterialEntry({ navigate }) {
  const prefill = null; // You can pass project from navigation if needed

  const [form, setForm] = useState({
    project:      prefill || '',
    material:     '',
    quantity:     '',
    unit:         'Bags',
    supplier:     '',
    deliveryDate: new Date().toISOString().split('T')[0],
    invoiceNo:    '',
    notes:        '',
  });

  const [loading, setLoading] = useState(false);
  const [openPicker, setOpenPicker] = useState(null);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function DropdownPicker({ fieldKey, label, options, icon }) {
    const isOpen = openPicker === fieldKey;

    return (
      <div style={{ marginBottom: SPACING.md }}>
        {label && <div style={{ fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs }}>{label}</div>}

        <div
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            padding: `${SPACING.sm + 2}px ${SPACING.md}px`,
            backgroundColor: COLORS.surface,
            cursor: 'pointer',
          }}
          onClick={() => setOpenPicker(isOpen ? null : fieldKey)}
        >
          {icon && <div style={{ marginRight: 8 }}>{icon}</div>}
          <div style={{ flex: 1, fontSize: FONTS.sizes.md, color: form[fieldKey] ? COLORS.text : COLORS.textLight }}>
            {form[fieldKey] || `Select ${label ? label.toLowerCase() : ''}...`}
          </div>
          {isOpen ? <IoChevronUp size={20} color={COLORS.textLight} /> : <IoChevronDown size={20} color={COLORS.textLight} />}
        </div>

        {isOpen && (
          <div style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            marginTop: 4,
            backgroundColor: COLORS.surface,
            overflow: 'hidden',
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            {options.map(opt => (
              <div
                key={opt}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderBottom: `1px solid ${COLORS.border}`,
                  cursor: 'pointer',
                }}
                onClick={() => { setField(fieldKey, opt); setOpenPicker(null); }}
              >
                {form[fieldKey] === opt ? 
                  <IoCheckmarkCircle size={18} color={COLORS.primary} /> : 
                  <Io