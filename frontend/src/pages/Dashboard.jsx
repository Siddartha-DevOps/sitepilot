import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppContext } from '../context/AppContext';
import Card        from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

// ── Sample data (replace with real API calls) ─────────────────────────────────
const SAMPLE_PROJECTS = [
  { id: '1', name: 'Highway NH-44 Widening',   location: 'Bangalore–Chennai', progress: 68, status: 'active'  },
  { id: '2', name: 'Commercial Complex Block A', location: 'Whitefield, BLR',  progress: 35, status: 'active'  },
  { id: '3', name: 'Residential Colony Phase 2', location: 'Anantapur, AP',    progress: 82, status: 'active'  },
];

const SAMPLE_ALERTS = [
  { id: '1', type: 'warning', message: 'Cement stock low on NH-44 project',  time: '2h ago' },
  { id: '2', type: 'info',    message: 'Daily report submitted for Block A',  time: '4h ago' },
  { id: '3', type: 'danger',  message: 'Steel rods below threshold – reorder!', time: '6h ago' },
];

const ALERT_COLORS = { warning: COLORS.warning, info: COLORS.info, danger: COLORS.danger };
const ALERT_ICONS  = { warning: 'warning', info: 'information-circle', danger: 'alert-circle' };

export default function DashboardScreen() {
  const navigation     = useNavigation();
  const { state }      = useAppContext();
  const insets         = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [todayReports, setTodayReports] = useState(3);

  const user     = state.user || { name: 'Site Engineer', company: 'Your Company' };
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000)); // Replace with real API calls
    setRefreshing(false);
  }

  // ── Quick-action button ─────────────────────────────────────────────────────
  function QuickAction({ icon, label, color, onPress }) {
    return (
      <TouchableOpacity style={[styles.qa, { borderColor: color }]} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.qaIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={[styles.qaLabel, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // ── Stat chip ───────────────────────────────────────────────────────────────
  function StatChip({ value, label, icon, color }) {
    return (
      <View style={[styles.chip, SHADOW.sm]}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.chipValue, { color }]}>{value}</Text>
        <Text style={styles.chipLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>sitePilot</Text>
          <Text style={styles.greeting}>{greeting}, {user.name?.split(' ')[0]} 👷</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Ionicons name="person" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatChip value={SAMPLE_PROJECTS.length} label="Active Sites"    icon="briefcase"    color={COLORS.primary} />
          <StatChip value={todayReports}            label="Today's Reports" icon="document-text" color={COLORS.success} />
          <StatChip value={SAMPLE_ALERTS.filter(a => a.type === 'danger').length} label="Alerts" icon="warning" color={COLORS.danger} />
        </View>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaRow}>
          <QuickAction icon="add-circle"      label="New Report"   color={COLORS.primary} onPress={() => navigation.navigate('DailyReport')} />
          <QuickAction icon="cube"            label="Add Material" color={COLORS.info}    onPress={() => navigation.navigate('MaterialEntry')} />
          <QuickAction icon="briefcase"       label="Projects"     color={COLORS.success} onPress={() => navigation.navigate('Projects')} />
          <QuickAction icon="camera"          label="Add Photo"    color={COLORS.warning} onPress={() => navigation.navigate('Photos')} />
        </View>

        {/* ── Active projects ──────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Active Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {SAMPLE_PROJECTS.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => navigation.navigate('ProjectDetails', { project: p })}
            activeOpacity={0.8}
          >
            <Card shadow="md" style={styles.projectCard}>
              <View style={styles.projectCardTop}>
                <View style={styles.projectDot} />
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{p.name}</Text>
                  <Text style={styles.projectLocation}>
                    <Ionicons name="location" size={12} color={COLORS.textLight} /> {p.location}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </View>
              <ProgressBar progress={p.progress} showPercent />
            </Card>
          </TouchableOpacity>
        ))}

        {/* ── Material alerts ──────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Material Alerts</Text>
        {SAMPLE_ALERTS.map(a => (
          <Card key={a.id} style={styles.alertCard}>
            <View style={styles.alertRow}>
              <View style={[styles.alertDot, { backgroundColor: ALERT_COLORS[a.type] }]}>
                <Ionicons name={ALERT_ICONS[a.type]} size={16} color="#fff" />
              </View>
              <View style={styles.alertText}>
                <Text style={styles.alertMsg}>{a.message}</Text>
                <Text style={styles.alertTime}>{a.time}</Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.background },
  topBar:        { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  brand:         { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.textWhite },
  greeting:      { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  avatar:        { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  scroll:        { padding: SPACING.md, paddingTop: SPACING.lg },
  statsRow:      { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  chip:          { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4 },
  chipValue:     { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  chipLabel:     { fontSize: FONTS.sizes.xs, color: COLORS.textLight, fontWeight: '600' },
  sectionTitle:  { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.secondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll:        { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700' },
  qaRow:         { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  qa:            { flex: 1, borderWidth: 1.5, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', backgroundColor: COLORS.surface },
  qaIcon:        { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel:       { fontSize: FONTS.sizes.xs, fontWeight: '700', textAlign: 'center' },
  projectCard:   { marginBottom: SPACING.sm },
  projectCardTop:{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  projectDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginRight: SPACING.sm },
  projectInfo:   { flex: 1 },
  projectName:   { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  projectLocation:{ fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  alertCard:     { marginBottom: SPACING.xs },
  alertRow:      { flexDirection: 'row', alignItems: 'center' },
  alertDot:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  alertText:     { flex: 1 },
  alertMsg:      { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  alertTime:     { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
});