import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import InputField from '../components/InputField';
import Button     from '../components/Button';
import Card       from '../components/Card';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const PROJECTS  = ['Highway NH-44 Widening', 'Commercial Complex Block A', 'Residential Colony Phase 2', 'Water Treatment Plant Ext.'];
const MATERIALS = ['Cement (OPC 53)', 'TMT Steel Bars', 'River Sand', 'Coarse Aggregate', 'Bricks (Class A)', 'Fly Ash', 'Plywood Sheets', 'PVC Pipes', 'Electrical Cables'];
const UNITS     = ['Bags', 'Tonnes', 'Cft', 'Nos', 'Kg', 'Litres', 'Meters', 'Sqft', 'Rmt'];

export default function MaterialEntryScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const prefill    = route.params?.project;

  const [form, setForm] = useState({
    project:      prefill?.name || '',
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

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function DropdownPicker({ fieldKey, label, options, icon }) {
    const isOpen = openPicker === fieldKey;
    return (
      <View style={{ marginBottom: SPACING.md }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => setOpenPicker(isOpen ? null : fieldKey)}
        >
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={form[fieldKey] ? styles.pickerText : styles.pickerPlaceholder}>
            {form[fieldKey] || `Select ${label.toLowerCase()}...`}
          </Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.dropdown}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => { setField(fieldKey, opt); setOpenPicker(null); }}
              >
                <Ionicons
                  name={form[fieldKey] === opt ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.dropdownText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  async function handleSubmit() {
    if (!form.project)  { Alert.alert('Required', 'Please select a project.'); return; }
    if (!form.material) { Alert.alert('Required', 'Please select a material.'); return; }
    if (!form.quantity) { Alert.alert('Required', 'Please enter quantity.'); return; }
    if (!form.supplier) { Alert.alert('Required', 'Please enter supplier name.'); return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      Alert.alert('Material Added ✅', `${form.quantity} ${form.unit} of ${form.material} added successfully.`, [
        { text: 'Add More', onPress: () => setForm(f => ({ ...f, material: '', quantity: '', supplier: '', invoiceNo: '', notes: '' })) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save material entry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Entry</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Project & Material ───────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>DELIVERY INFORMATION</Text>

          <DropdownPicker
            fieldKey="project"
            label="Project *"
            options={PROJECTS}
            icon={<Ionicons name="briefcase-outline" size={20} color={COLORS.textLight} />}
          />

          <DropdownPicker
            fieldKey="material"
            label="Material Name *"
            options={MATERIALS}
            icon={<Ionicons name="cube-outline" size={20} color={COLORS.textLight} />}
          />

          {/* Quantity + Unit row */}
          <Text style={styles.fieldLabel}>Quantity & Unit *</Text>
          <View style={styles.qtyRow}>
            <InputField
              value={form.quantity}
              onChangeText={v => setField('quantity', v)}
              placeholder="e.g. 200"
              keyboardType="numeric"
              style={{ flex: 1, marginRight: SPACING.sm, marginBottom: 0 }}
            />
            <DropdownPicker
              fieldKey="unit"
              label=""
              options={UNITS}
            />
          </View>

          <InputField
            label="Supplier Name *"
            value={form.supplier}
            onChangeText={v => setField('supplier', v)}
            placeholder="e.g. Ramco Cements Ltd."
            icon={<Ionicons name="business-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Delivery Date"
            value={form.deliveryDate}
            onChangeText={v => setField('deliveryDate', v)}
            placeholder="YYYY-MM-DD"
            icon={<Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Invoice / Bill No."
            value={form.invoiceNo}
            onChangeText={v => setField('invoiceNo', v)}
            placeholder="e.g. INV-2025-001"
            icon={<Ionicons name="receipt-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Notes"
            value={form.notes}
            onChangeText={v => setField('notes', v)}
            placeholder="Quality remarks, damage notes..."
            multiline
            numberOfLines={3}
            icon={<Ionicons name="create-outline" size={20} color={COLORS.textLight} />}
          />
        </Card>

        {/* ── Quick summary ────────────────────────────────────────────── */}
        {form.material && form.quantity && (
          <Card shadow="sm" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Entry Summary</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="cube" size={20} color={COLORS.primary} />
              <Text style={styles.summaryText}>{form.quantity} {form.unit} of <Text style={{ fontWeight: '800' }}>{form.material}</Text></Text>
            </View>
            {form.supplier && (
              <View style={styles.summaryRow}>
                <Ionicons name="business" size={20} color={COLORS.textLight} />
                <Text style={styles.summaryText}>From: {form.supplier}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={20} color={COLORS.textLight} />
              <Text style={styles.summaryText}>Date: {form.deliveryDate}</Text>
            </View>
          </Card>
        )}

        <Button
          title="Save Material Entry"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
          icon={<Ionicons name="save" size={20} color={COLORS.textWhite} />}
        />
        <Button
          title="Cancel"
          variant="ghost"
          size="lg"
          onPress={() => navigation.goBack()}
          style={{ marginBottom: SPACING.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: COLORS.background },
  header:         { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  backBtn:        { padding: 4 },
  headerTitle:    { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  scroll:         { padding: SPACING.md, paddingBottom: 40 },
  sectionLabel:   { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  fieldLabel:     { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  pickerBtn:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, backgroundColor: COLORS.surface },
  pickerText:     { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  pickerPlaceholder: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textLight },
  dropdown:       { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: 4, backgroundColor: COLORS.surface, overflow: 'hidden', maxHeight: 200 },
  dropdownItem:   { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownText:   { fontSize: FONTS.sizes.sm, color: COLORS.text, marginLeft: SPACING.sm },
  qtyRow:         { flexDirection: 'row', alignItems: 'flex-start' },
  summaryCard:    { backgroundColor: COLORS.primary + '10', borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  summaryTitle:   { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.sm, letterSpacing: 0.5 },
  summaryRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  summaryText:    { fontSize: FONTS.sizes.sm, color: COLORS.text },
  submitBtn:      { marginBottom: SPACING.sm },
});