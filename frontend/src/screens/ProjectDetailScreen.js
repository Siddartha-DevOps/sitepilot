import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import Card        from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button      from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Reports', 'Materials', 'Photos'];

const SAMPLE_REPORTS = [
  { id: '1', date: '2025-01-14', work: 'Completed foundation pouring – Grid B3 to B7', workers: 24, submittedBy: 'Ravi Kumar' },
  { id: '2', date: '2025-01-13', work: 'Formwork removal & scaffolding setup Level 2',   workers: 18, submittedBy: 'Suresh M' },
  { id: '3', date: '2025-01-12', work: 'Concrete curing – Level 1 slabs inspected',       workers: 12, submittedBy: 'Ravi Kumar' },
];

const SAMPLE_MATERIALS = [
  { id: '1', name: 'Cement (OPC 53)',  quantity: 480,  unit: 'Bags',    status: 'ok'  },
  { id: '2', name: 'TMT Steel Bars',   quantity: 12,   unit: 'Tonnes',  status: 'low' },
  { id: '3', name: 'River Sand',       quantity: 220,  unit: 'Cft',     status: 'ok'  },
  { id: '4', name: 'Coarse Aggregate', quantity: 5,    unit: 'Tonnes',  status: 'low' },
  { id: '5', name: 'Bricks (Class A)', quantity: 8400, unit: 'Nos',     status: 'ok'  },
];

const SAMPLE_PHOTOS = [
  { id: '1', uri: 'https://picsum.photos/seed/site1/400/300', note: 'Foundation work – Grid B3', date: '2025-01-14' },
  { id: '2', uri: 'https://picsum.photos/seed/site2/400/300', note: 'Steel reinforcement Level 1', date: '2025-01-13' },
  { id: '3', uri: 'https://picsum.photos/seed/site3/400/300', note: 'Concrete pour complete',      date: '2025-01-12' },
  { id: '4', uri: 'https://picsum.photos/seed/site4/400/300', note: 'Scaffolding setup Level 2',   date: '2025-01-11' },
];

export default function ProjectDetailsScreen() {
  const navigation  = useNavigation();
  const route       = useRoute();
  const insets      = useSafeAreaInsets();
  const { project } = route.params || {};

  const [activeTab, setActiveTab] = useState('Overview');

  function InfoRow({ icon, label, value }) {
    return (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={18} color={COLORS.primary} style={{ width: 28 }} />
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  }

  // ── Tab: Overview ──────────────────────────────────────────────────────────
  function OverviewTab() {
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Card shadow="md">
          <Text style={styles.cardTitle}>Project Progress</Text>
          <ProgressBar progress={project?.progress || 0} showPercent />
          <View style={styles.statsGrid}>
            {[
              { label: 'Days Left',     value: '168', color: COLORS.primary },
              { label: 'Tasks Done',    value: '34',  color: COLORS.success },
              { label: 'Reports Filed', value: '21',  color: COLORS.info    },
              { label: 'Alerts',        value: '2',   color: COLORS.danger  },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card shadow="sm">
          <Text style={styles.cardTitle}>Details</Text>
          <InfoRow icon="location-outline"  label="Location"    value={project?.location || '–'} />
          <InfoRow icon="calendar-outline"  label="Start Date"  value={project?.startDate || '2024-01-10'} />
          <InfoRow icon="flag-outline"      label="End Date"    value={project?.endDate   || '2025-06-30'} />
          <InfoRow icon="cash-outline"      label="Budget"      value={project?.budget    || '₹4.2 Cr'} />
          <InfoRow icon="person-outline"    label="Manager"     value={project?.manager   || 'Ravi Kumar'} />
          <InfoRow icon="checkmark-circle-outline" label="Status" value={(project?.status || 'active').toUpperCase()} />
        </Card>

        <View style={styles.actionRow}>
          <Button title="New Report"    onPress={() => navigation.navigate('DailyReport', { project })}   style={{ flex: 1, marginRight: 8 }} />
          <Button title="Add Material"  onPress={() => navigation.navigate('MaterialEntry', { project })} variant="outline" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    );
  }

  // ── Tab: Reports ───────────────────────────────────────────────────────────
  function ReportsTab() {
    return (
      <FlatList
        data={SAMPLE_REPORTS}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.tabContent}
        renderItem={({ item }) => (
          <Card shadow="sm" style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>{item.date.split('-')[2]}</Text>
                <Text style={styles.dateMon}>{new Date(item.date).toLocaleString('default', { month: 'short' })}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.reportWork} numberOfLines={2}>{item.work}</Text>
                <Text style={styles.reportMeta}>👷 {item.workers} workers  •  {item.submittedBy}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
            </View>
          </Card>
        )}
        ListHeaderComponent={
          <Button title="+ New Daily Report" onPress={() => navigation.navigate('DailyReport', { project })} style={{ marginBottom: SPACING.md }} />
        }
      />
    );
  }

  // ── Tab: Materials ─────────────────────────────────────────────────────────
  function MaterialsTab() {
    return (
      <FlatList
        data={SAMPLE_MATERIALS}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.tabContent}
        renderItem={({ item }) => (
          <Card shadow="sm">
            <View style={styles.matRow}>
              <View style={[styles.matIcon, { backgroundColor: item.status === 'low' ? COLORS.danger + '15' : COLORS.success + '15' }]}>
                <Ionicons name="cube" size={22} color={item.status === 'low' ? COLORS.danger : COLORS.success} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.matName}>{item.name}</Text>
                <Text style={styles.matQty}>{item.quantity} {item.unit}</Text>
              </View>
              {item.status === 'low' && (
                <View style={styles.lowBadge}>
                  <Text style={styles.lowText}>LOW</Text>
                </View>
              )}
            </View>
          </Card>
        )}
        ListHeaderComponent={
          <Button title="+ Add Material" onPress={() => navigation.navigate('MaterialEntry', { project })} style={{ marginBottom: SPACING.md }} />
        }
      />
    );
  }

  // ── Tab: Photos ────────────────────────────────────────────────────────────
  function PhotosTab() {
    const photoW = (width - SPACING.md * 2 - SPACING.sm) / 2;
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Button title="+ Add Photo" onPress={() => navigation.navigate('Photos')} style={{ marginBottom: SPACING.md }} />
        <View style={styles.photoGrid}>
          {SAMPLE_PHOTOS.map(p => (
            <View key={p.id} style={[styles.photoCard, { width: photoW }]}>
              <Image source={{ uri: p.uri }} style={[styles.photoImg, { width: photoW, height: photoW * 0.75 }]} />
              <Text style={styles.photoNote} numberOfLines={2}>{p.note}</Text>
              <Text style={styles.photoDate}>{p.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  const tabContent = { Overview: <OverviewTab />, Reports: <ReportsTab />, Materials: <MaterialsTab />, Photos: <PhotosTab /> };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{project?.name || 'Project Details'}</Text>
          <Text style={styles.headerSub}>{project?.location}</Text>
        </View>
      </View>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tabContent[activeTab]}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: COLORS.background },
  header:       { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  backBtn:      { padding: 4 },
  headerTitle:  { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textWhite },
  headerSub:    { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)' },
  tabBar:       { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn:       { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText:      { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textLight },
  tabTextActive:{ color: COLORS.primary, fontWeight: '800' },
  tabContent:   { padding: SPACING.md, paddingBottom: 40 },
  cardTitle:    { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, gap: SPACING.sm },
  statBox:      { flex: 1, minWidth: '45%', backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  statValue:    { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  statLabel:    { fontSize: FONTS.sizes.xs, color: COLORS.textLight, fontWeight: '600', marginTop: 2 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel:    { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textLight, fontWeight: '600' },
  infoValue:    { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '700' },
  actionRow:    { flexDirection: 'row', marginTop: SPACING.sm },
  reportCard:   { marginBottom: SPACING.sm },
  reportHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBadge:    { width: 44, height: 52, backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  dateDay:      { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.primary },
  dateMon:      { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },
  reportWork:   { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  reportMeta:   { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 4 },
  matRow:       { flexDirection: 'row', alignItems: 'center' },
  matIcon:      { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  matName:      { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  matQty:       { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 },
  lowBadge:     { backgroundColor: COLORS.danger + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  lowText:      { fontSize: 10, fontWeight: '800', color: COLORS.danger },
  photoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  photoCard:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.sm },
  photoImg:     { resizeMode: 'cover' },
  photoNote:    { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.text, padding: 8, paddingBottom: 2 },
  photoDate:    { fontSize: 10, color: COLORS.textLight, paddingHorizontal: 8, paddingBottom: 8 },
});