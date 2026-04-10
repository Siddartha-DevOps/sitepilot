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
  const prefill = null;

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
        {label && (
          <div style={{ fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs }}>
            {label}
          </div>
        )}

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
            overflowY: 'auto',
          }}>
            {options.map(opt => (
              <div
                key={opt}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderBottom: `1px solid ${COLORS.border}`,
                  cursor: 'pointer',
                }}
                onClick={() => { setField(fieldKey, opt); setOpenPicker(null); }}
              >
                {form[fieldKey] === opt
                  ? <IoCheckmarkCircle size={18} color={COLORS.primary} />
                  : <IoEllipseOutline size={18} color={COLORS.textLight} />
                }
                <div style={{ marginLeft: 8, fontSize: FONTS.sizes.md, color: COLORS.text }}>
                  {opt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    if (!form.project || !form.material || !form.quantity) {
      alert('Please fill in Project, Material, and Quantity.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate API call
    setLoading(false);
    alert('Material entry saved successfully!');
    if (navigate) navigate('dashboard');
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: SPACING.md }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: SPACING.lg }}>
        {navigate && (
          <div style={{ cursor: 'pointer', marginRight: SPACING.md }} onClick={() => navigate('dashboard')}>
            <IoArrowBack size={24} color={COLORS.text} />
          </div>
        )}
        <div>
          <div style={{ fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text }}>Material Entry</div>
          <div style={{ fontSize: FONTS.sizes.sm, color: COLORS.textLight }}>Record new material delivery</div>
        </div>
      </div>

      <Card style={{ padding: SPACING.lg }}>
        {/* Project */}
        <DropdownPicker
          fieldKey="project"
          label="Project"
          options={PROJECTS}
          icon={<IoBriefcaseOutline size={18} color={COLORS.textLight} />}
        />

        {/* Material */}
        <DropdownPicker
          fieldKey="material"
          label="Material"
          options={MATERIALS}
          icon={<IoCubeOutline size={18} color={COLORS.textLight} />}
        />

        {/* Quantity + Unit */}
        <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.md }}>
          <div style={{ flex: 2 }}>
            <InputField
              label="Quantity"
              value={form.quantity}
              onChange={e => setField('quantity', e.target.value)}
              type="number"
              placeholder="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <DropdownPicker
              fieldKey="unit"
              label="Unit"
              options={UNITS}
            />
          </div>
        </div>

        {/* Supplier */}
        <InputField
          label="Supplier"
          value={form.supplier}
          onChange={e => setField('supplier', e.target.value)}
          placeholder="Supplier name"
          icon={<IoBusinessOutline size={18} color={COLORS.textLight} />}
        />

        {/* Delivery Date */}
        <InputField
          label="Delivery Date"
          value={form.deliveryDate}
          onChange={e => setField('deliveryDate', e.target.value)}
          type="date"
          icon={<IoCalendarOutline size={18} color={COLORS.textLight} />}
        />

        {/* Invoice No */}
        <InputField
          label="Invoice No."
          value={form.invoiceNo}
          onChange={e => setField('invoiceNo', e.target.value)}
          placeholder="e.g. INV-2024-001"
          icon={<IoReceiptOutline size={18} color={COLORS.textLight} />}
        />

        {/* Notes */}
        <div style={{ marginBottom: SPACING.md }}>
          <div style={{ fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs }}>
            Notes (optional)
          </div>
          <textarea
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Any additional remarks..."
            rows={3}
            style={{
              width: '100%',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: RADIUS.md,
              padding: SPACING.sm,
              fontSize: FONTS.sizes.md,
              color: COLORS.text,
              backgroundColor: COLORS.surface,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <Button
          label={loading ? 'Saving...' : 'Save Entry'}
          onClick={handleSubmit}
          disabled={loading}
          icon={<IoSave size={18} color="#fff" />}
        />
      </Card>
    </div>
  );
}