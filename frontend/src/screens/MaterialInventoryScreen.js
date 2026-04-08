import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Card   from '../components/Card';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const INVENTORY = [
  { id:'1',  name:'Cement (OPC 53)',   qty:480,  unit:'Bags',   min:100, project:'NH-44',       lastDelivery:'2025-01-12', supplier:'Ramco Cements' },
  { id:'2',  name:'TMT Steel Bars',    qty:8,    unit:'Tonnes', min:10,  project:'NH-44',       lastDelivery:'2025-01-10', supplier:'TATA Steel'   },
  { id:'3',  name:'River Sand',        qty:220,  unit:'Cft',    min:50,  project:'Block A',     lastDelivery:'2025-01-08', supplier:'Local Quarry' },
  { id:'4',  name:'Coarse Aggregate',  qty:4,    unit:'Tonnes', min:8,   project:'Block A',     lastDelivery:'2025-01-05', supplier:'Apex Agg.'   },
  { id:'5',  name:'Bricks (Class A)',  qty:8400, unit:'Nos',    min:1000,project:'Colony Ph2',  lastDelivery:'2025-01-14', supplier:'BM Bricks'   },
  { id:'6',  name:'Fly Ash',           qty:60,   unit:'Bags',   min:20,  project:'WTP Ext.',   lastDelivery:'2025-01-11', supplier:'Fly Ash Corp' },
  { id:'7',  name:'Plywood Sheets',    qty:35,   unit:'Nos',    min:15,  project:'NH-44',       lastDelivery:'2025-01-09', supplier:'Ply World'   },
  { id:'8',  name:'PVC Pipes (4")',    qty:2,    unit:'Rmt',    min:10,  project:'WTP Ext.',   lastDelivery:'2025-01-13', supplier:'Supreme Pipe' },
  { id:'9',  name:'Electrical Cable',  qty:180,  unit:'Meters', min:50,  project:'Block A',     lastDelivery:'2025-01-07', supplier:'Polycab'     },
];

function getStockStatus(qty, min) {
  if (qty <= min * 0.5) return 'critical';
  if (qty <= min)       return 'low';
  return 'ok';
}

const STATUS_CONFIG = {
  ok:       { color: COLORS.success, label: 'OK',       icon: 'checkmark-circle' },
  low:      { color: COLORS.warning, label: 'LOW',      icon: 'warning'          },
  critical: { color: COLORS.danger,  label: 'CRITICAL', icon: 'alert-circle'     },
};

export default function MaterialInventoryScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();

  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('all');

  const enriched = INVENTORY.map(m => ({
    ...m, status: getStockStatus(m.qty, m.min),
  }));

  const filtered = enriched.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.project.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterType === 'all' || m.status === filterType;
    return matchSearch && matchFilter;
  });

  const lowCount      = enriched.filter(m => m.status === 'low').length;
  const criticalCount = enriched.filter(m => m.status === 'critical').length;

  function SummaryPill({ label, value, color }) {
    return (
      <View style={[styles.summaryPill, { borderColor: color }]}>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    );
  }

  function FilterPill({ label, value }) {
    const active = filterType === value;
    return (
      <TouchableOpacity
        style={[styles.pill, active && styles.pillActive]}
        onPress={() => setFilterType(value)}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function MaterialCard({ item }) {
    const cfg     = STATUS_CONFIG[item.status];
    const pctLeft = Math.round((item.qty / (item.min * 3)) * 100);

    return (
      <Card shadow="sm" style={styles.matCard}>
        <View style={styles.matTop}>
          <View style={[styles.matIcon, { backgroundColor: cfg.color + '15' }]}>
            <Ionicons name="cube" size={24} color={cfg.color} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.matName}>{item.name}</Text>
            <Text style={styles.matProject}>📍 {item.project}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '15' }]}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Stock bar */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, {
              width: `${Math.min(100, pctLeft)}%`,
              backgroundColor: cfg.color,
            }]} />
          </View>
        </View>

        <View style={styles.matMeta}>
          <Text style={styles.metaMain}>
            <Text style={[styles.qtyBold, { color: cfg.color }]}>{item.qty}</Text> {item.unit} in stock
          </Text>
          <Text style={styles.metaSub}>Min: {item.min} {item.unit}</Text>
        </View>

        <View style={styles.matFooter}>
          <Text style={styles.footerText}>🏭 {item.supplier}</Text>
          <Text style={styles.footerText}>📦 {item.lastDelivery}</Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brand}>sitePilot</Text>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('MaterialEntry')}
        >
          <Ionicons name="add" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {/* ── Alert summary ─────────────────────────────────────────────── */}
      {(lowCount + criticalCount) > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={18} color={COLORS.warning} />
          <Text style={styles.alertBannerText}>
            {criticalCount > 0 ? `${criticalCount} critical` : ''}{criticalCount > 0 && lowCount > 0 ? ' & ' : ''}{lowCount > 0 ? `${lowCount} low` : ''} stock items need attention
          </Text>
        </View>
      )}

      {/* ── Summary pills ─────────────────────────────────────────────── */}
      <View style={styles.summaryRow}>
        <SummaryPill label="Total Items" value={enriched.length}  color={COLORS.primary} />
        <SummaryPill label="OK"          value={enriched.filter(m => m.status === 'ok').length}       color={COLORS.success} />
        <SummaryPill label="Low"         value={lowCount}      color={COLORS.warning} />
        <SummaryPill label="Critical"    value={criticalCount} color={COLORS.danger}  />
      </View>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search materials or project..."
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </View>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <View style={styles.filters}>
        <FilterPill label="All"      value="all"      />
        <FilterPill label="OK"       value="ok"       />
        <FilterPill label="Low"      value="low"      />
        <FilterPill label="Critical" value="critical" />
      </View>

      {/* ── List ──────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MaterialCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No materials found</Text>
          </View>
        }
      />

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('MaterialEntry')}>
        <Ionicons name="add" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: COLORS.background },
  header:          { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  brand:           { fontSize: FONTS.sizes.md, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  headerTitle:     { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  addBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  alertBanner:     { backgroundColor: COLORS.warning + '15', flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm + 4, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.warning + '30' },
  alertBannerText: { fontSize: FONTS.sizes.sm, color: COLORS.warning, fontWeight: '700', flex: 1 },
  summaryRow:      { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, paddingBottom: 0 },
  summaryPill:     { flex: 1, borderWidth: 1.5, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', backgroundColor: COLORS.surface },
  summaryValue:    { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  summaryLabel:    { fontSize: 10, color: COLORS.textLight, fontWeight: '700', marginTop: 2 },
  searchRow:       { padding: SPACING.md, paddingBottom: SPACING.xs },
  searchBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...SHADOW.sm },
  searchInput:     { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  filters:         { flexDirection: 'row', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  pill:            { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pillActive:      { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText:        { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textLight },
  pillTextActive:  { color: COLORS.textWhite },
  list:            { padding: SPACING.md, paddingTop: 0, paddingBottom: 100 },
  matCard:         { marginBottom: SPACING.sm },
  matTop:          { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  matIcon:         { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  matName:         { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  matProject:      { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText:      { fontSize: 10, fontWeight: '800' },
  barRow:          { marginBottom: SPACING.sm },
  barTrack:        { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: RADIUS.full },
  matMeta:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metaMain:        { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  qtyBold:         { fontSize: FONTS.sizes.lg, fontWeight: '900' },
  metaSub:         { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  matFooter:       { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText:      { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  empty:           { alignItems: 'center', paddingTop: 80 },
  emptyText:       { fontSize: FONTS.sizes.md, color: COLORS.textLight, marginTop: SPACING.md },
  fab:             { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
});