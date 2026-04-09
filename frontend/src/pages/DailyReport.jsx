import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Image, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import InputField from '../components/InputField';
import Button     from '../components/Button';
import Card       from '../components/Card';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const PROJECTS = [
  'Highway NH-44 Widening',
  'Commercial Complex Block A',
  'Residential Colony Phase 2',
  'Water Treatment Plant Ext.',
];

export default function DailyReportScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const prefill    = route.params?.project;

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    project:     prefill?.name || '',
    date:        today,
    workDone:    '',
    workers:     '',
    materials:   '',
    notes:       '',
  });
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhotos(prev => [...prev, result.assets[0].uri]);
  }

  async function handleSubmit() {
    if (!form.project)  { Alert.alert('Required', 'Please select a project.'); return; }
    if (!form.workDone) { Alert.alert('Required', 'Please describe the work completed.'); return; }
    if (!form.workers)  { Alert.alert('Required', 'Please enter worker count.'); return; }

    setLoading(true);
    try {
      // Replace with: await reportService.create({ ...form, photos });
      await new Promise(r => setTimeout(r, 1200));
      Alert.alert('Report Submitted ✅', 'Daily report has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit report. Saved offline.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Project picker ───────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>PROJECT DETAILS</Text>

          <Text style={styles.fieldLabel}>Project *</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowProjectPicker(v => !v)}
          >
            <Text style={form.project ? styles.pickerText : styles.pickerPlaceholder}>
              {form.project || 'Select project...'}
            </Text>
            <Ionicons name={showProjectPicker ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          {showProjectPicker && (
            <View style={styles.dropdown}>
              {PROJECTS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={styles.dropdownItem}
                  onPress={() => { setField('project', p); setShowProjectPicker(false); }}
                >
                  <Ionicons name={form.project === p ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={COLORS.primary} />
                  <Text style={styles.dropdownText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <InputField
            label="Date *"
            value={form.date}
            onChangeText={v => setField('date', v)}
            placeholder="YYYY-MM-DD"
            icon={<Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />}
          />
        </Card>

        {/* ── Work details ─────────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>WORK DETAILS</Text>

          <InputField
            label="Work Completed *"
            value={form.workDone}
            onChangeText={v => setField('workDone', v)}
            placeholder="Describe today's work in detail..."
            multiline
            numberOfLines={4}
            icon={<Ionicons name="construct-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Workers on Site *"
            value={form.workers}
            onChangeText={v => setField('workers', v)}
            placeholder="e.g. 24"
            keyboardType="numeric"
            icon={<Ionicons name="people-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Materials Used"
            value={form.materials}
            onChangeText={v => setField('materials', v)}
            placeholder="e.g. 40 bags cement, 2T steel..."
            multiline
            numberOfLines={3}
            icon={<Ionicons name="cube-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Additional Notes"
            value={form.notes}
            onChangeText={v => setField('notes', v)}
            placeholder="Issues, observations, next steps..."
            multiline
            numberOfLines={3}
            icon={<Ionicons name="document-text-outline" size={20} color={COLORS.textLight} />}
          />
        </Card>

        {/* ── Photos ───────────────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>PROGRESS PHOTOS</Text>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Ionicons name="camera" size={26} color={COLORS.primary} />
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Ionicons name="image" size={26} color={COLORS.info} />
              <Text style={[styles.photoBtnText, { color: COLORS.info }]}>Upload</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.sm }}>
              {photos.map((uri, idx) => (
                <View key={idx} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {photos.length === 0 && (
            <View style={styles.noPhotos}>
              <Ionicons name="camera-outline" size={40} color={COLORS.border} />
              <Text style={styles.noPhotosText}>No photos added yet</Text>
            </View>
          )}
        </Card>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <Button
          title="Submit Daily Report"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
          icon={<Ionicons name="checkmark-circle" size={20} color={COLORS.textWhite} />}
        />

        <Button
          title="Save as Draft"
          variant="outline"
          size="lg"
          onPress={() => Alert.alert('Saved', 'Draft saved locally.')}
          style={{ marginBottom: SPACING.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: COLORS.background },
  header:          { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  backBtn:         { padding: 4 },
  headerTitle:     { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  scroll:          { padding: SPACING.md, paddingBottom: 40 },
  sectionLabel:    { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  fieldLabel:      { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  pickerBtn:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, marginBottom: SPACING.md, backgroundColor: COLORS.surface },
  pickerText:      { fontSize: FONTS.sizes.md, color: COLORS.text },
  pickerPlaceholder: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  dropdown:        { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginBottom: SPACING.md, backgroundColor: COLORS.surface, overflow: 'hidden' },
  dropdownItem:    { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownText:    { fontSize: FONTS.sizes.sm, color: COLORS.text, marginLeft: SPACING.sm },
  photoActions:    { flexDirection: 'row', gap: SPACING.md },
  photoBtn:        { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, paddingVertical: SPACING.lg, alignItems: 'center', gap: 8 },
  photoBtnText:    { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  photoThumb:      { marginRight: SPACING.sm, position: 'relative' },
  thumbImg:        { width: 90, height: 90, borderRadius: RADIUS.md },
  removePhoto:     { position: 'absolute', top: -8, right: -8 },
  noPhotos:        { alignItems: 'center', paddingVertical: SPACING.lg },
  noPhotosText:    { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 8 },
  submitBtn:       { marginTop: SPACING.sm, marginBottom: SPACING.sm },
});
