import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, TextInput, FlatList, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import Button from '../components/Button';
import Card   from '../components/Card';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');
const THUMB = (width - SPACING.md * 2 - SPACING.sm * 2) / 3;

const PROJECTS = [
  'Highway NH-44 Widening',
  'Commercial Complex Block A',
  'Residential Colony Phase 2',
  'Water Treatment Plant Ext.',
];

const RECENT_PHOTOS = [
  { id:'1', uri:'https://picsum.photos/seed/c1/400/300', note:'Foundation Grid B3',   project:'NH-44',   date:'2025-01-14' },
  { id:'2', uri:'https://picsum.photos/seed/c2/400/300', note:'Steel reinforcement',  project:'Block A', date:'2025-01-13' },
  { id:'3', uri:'https://picsum.photos/seed/c3/400/300', note:'Concrete pour done',   project:'NH-44',   date:'2025-01-12' },
  { id:'4', uri:'https://picsum.photos/seed/c4/400/300', note:'Scaffolding Level 2',  project:'Block A', date:'2025-01-11' },
  { id:'5', uri:'https://picsum.photos/seed/c5/400/300', note:'Site clearing phase',  project:'Colony',  date:'2025-01-10' },
  { id:'6', uri:'https://picsum.photos/seed/c6/400/300', note:'Equipment arrived',    project:'WTP',     date:'2025-01-09' },
];

export default function PhotoUploadScreen() {
  const insets = useSafeAreaInsets();

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [note,           setNote]           = useState('');
  const [project,        setProject]        = useState('');
  const [showPicker,     setShowPicker]     = useState(false);
  const [uploading,      setUploading]      = useState(false);

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) setSelectedPhotos(prev => [...prev, { uri: res.assets[0].uri, note: '' }]);
  }

  async function handleGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library access is required.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!res.canceled) {
      setSelectedPhotos(prev => [...prev, ...res.assets.map(a => ({ uri: a.uri, note: '' }))]);
    }
  }

  function removePhoto(idx) {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (!project) { Alert.alert('Required', 'Please select a project.'); return; }
    if (selectedPhotos.length === 0) { Alert.alert('Required', 'Please select at least one photo.'); return; }

    setUploading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      Alert.alert('Uploaded ✅', `${selectedPhotos.length} photo(s) uploaded successfully.`);
      setSelectedPhotos([]);
      setNote('');
      setProject('');
    } catch {
      Alert.alert('Error', 'Upload failed. Photos saved locally.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brand}>sitePilot</Text>
        <Text style={styles.headerTitle}>Photos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Upload zone ─────────────────────────────────────────────── */}
        <Card shadow="md">
          <Text style={styles.sectionLabel}>ADD NEW PHOTOS</Text>

          {/* Camera / Gallery buttons */}
          <View style={styles.uploadBtns}>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleCamera} activeOpacity={0.8}>
              <View style={styles.uploadIcon}>
                <Ionicons name="camera" size={36} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadBtnTitle}>Take Photo</Text>
              <Text style={styles.uploadBtnSub}>Use camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleGallery} activeOpacity={0.8}>
              <View style={[styles.uploadIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="images" size={36} color={COLORS.info} />
              </View>
              <Text style={styles.uploadBtnTitle}>Upload Photos</Text>
              <Text style={styles.uploadBtnSub}>From gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Selected photos grid */}
          {selectedPhotos.length > 0 && (
            <View style={styles.selectedGrid}>
              {selectedPhotos.map((p, idx) => (
                <View key={idx} style={styles.selectedThumb}>
                  <Image source={{ uri: p.uri }} style={{ width: THUMB, height: THUMB * 0.75, borderRadius: RADIUS.sm }} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(idx)}>
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add more */}
              <TouchableOpacity style={[styles.addMoreThumb, { width: THUMB, height: THUMB * 0.75 }]} onPress={handleGallery}>
                <Ionicons name="add" size={30} color={COLORS.primary} />
                <Text style={styles.addMoreText}>More</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedPhotos.length === 0 && (
            <View style={styles.dropZone}>
              <Ionicons name="cloud-upload-outline" size={48} color={COLORS.border} />
              <Text style={styles.dropText}>No photos selected</Text>
              <Text style={styles.dropSub}>Tap camera or upload above</Text>
            </View>
          )}
        </Card>

        {/* ── Details ─────────────────────────────────────────────────── */}
        {selectedPhotos.length > 0 && (
          <Card shadow="sm">
            <Text style={styles.sectionLabel}>PHOTO DETAILS</Text>

            {/* Project picker */}
            <Text style={styles.fieldLabel}>Project *</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPicker(v => !v)}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <Text style={project ? styles.pickerText : styles.pickerPH}>
                {project || 'Select project...'}
              </Text>
              <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textLight} />
            </TouchableOpacity>

            {showPicker && (
              <View style={styles.dropdown}>
                {PROJECTS.map(p => (
                  <TouchableOpacity key={p} style={styles.dropItem} onPress={() => { setProject(p); setShowPicker(false); }}>
                    <Ionicons name={project === p ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={COLORS.primary} />
                    <Text style={styles.dropText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Notes */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Notes / Caption</Text>
            <View style={styles.noteBox}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Describe what's in these photos..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <Button
              title={`Upload ${selectedPhotos.length} Photo${selectedPhotos.length > 1 ? 's' : ''}`}
              onPress={handleUpload}
              loading={uploading}
              size="lg"
              style={{ marginTop: SPACING.md }}
              icon={<Ionicons name="cloud-upload" size={20} color={COLORS.textWhite} />}
            />
          </Card>
        )}

        {/* ── Recent photos ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Recent Photos</Text>
        <View style={styles.recentGrid}>
          {RECENT_PHOTOS.map(p => (
            <View key={p.id} style={styles.recentCard}>
              <Image
                source={{ uri: p.uri }}
                style={{ width: THUMB, height: THUMB * 0.75 }}
                resizeMode="cover"
              />
              <View style={styles.recentInfo}>
                <Text style={styles.recentNote} numberOfLines={1}>{p.note}</Text>
                <Text style={styles.recentProject}>{p.project} • {p.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.background },
  header:        { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  brand:         { fontSize: FONTS.sizes.md, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  headerTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  scroll:        { padding: SPACING.md, paddingBottom: 40 },
  sectionLabel:  { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  sectionTitle:  { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.secondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  uploadBtns:    { flexDirection: 'row', gap: SPACING.md },
  uploadBtn:     { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  uploadIcon:    { width: 64, height: 64, borderRadius: RADIUS.md, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  uploadBtnTitle:{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  uploadBtnSub:  { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  selectedGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  selectedThumb: { position: 'relative' },
  removeBtn:     { position: 'absolute', top: -10, right: -10 },
  addMoreThumb:  { borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  addMoreText:   { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },
  dropZone:      { alignItems: 'center', paddingVertical: SPACING.xl, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, marginTop: SPACING.md },
  dropText:      { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textLight, marginTop: 8 },
  dropSub:       { fontSize: FONTS.sizes.xs, color: COLORS.border, marginTop: 4 },
  fieldLabel:    { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  pickerBtn:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, backgroundColor: COLORS.surface },
  pickerText:    { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  pickerPH:      { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textLight },
  dropdown:      { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: 4, backgroundColor: COLORS.surface, overflow: 'hidden' },
  dropItem:      { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropText:      { fontSize: FONTS.sizes.sm, color: COLORS.text, marginLeft: SPACING.sm },
  noteBox:       { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, padding: SPACING.md },
  noteInput:     { fontSize: FONTS.sizes.md, color: COLORS.text, minHeight: 80, textAlignVertical: 'top' },
  recentGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  recentCard:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.sm, width: THUMB },
  recentInfo:    { padding: 6 },
  recentNote:    { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.text },
  recentProject: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
});