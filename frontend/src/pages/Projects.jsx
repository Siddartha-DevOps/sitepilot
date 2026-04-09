import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Card        from '../components/Card';
import Button      from '../components/Button';
import InputField  from '../components/InputField';
import ProgressBar from '../components/ProgressBar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const INITIAL_PROJECTS = [
  { id: '1', name: 'Highway NH-44 Widening',     location: 'Bangalore–Chennai', progress: 68, status: 'active',   startDate: '2024-01-10', endDate: '2025-06-30', budget: '₹4.2 Cr', manager: 'Ravi Kumar'   },
  { id: '2', name: 'Commercial Complex Block A',  location: 'Whitefield, BLR',  progress: 35, status: 'active',   startDate: '2024-03-15', endDate: '2025-09-30', budget: '₹8.7 Cr', manager: 'Priya Sharma' },
  { id: '3', name: 'Residential Colony Phase 2',  location: 'Anantapur, AP',    progress: 82, status: 'active',   startDate: '2023-11-01', endDate: '2025-03-31', budget: '₹2.1 Cr', manager: 'Suresh Reddy' },
  { id: '4', name: 'Flyover Bridge Sector 12',    location: 'Hyderabad, TS',    progress:100, status: 'completed', startDate: '2023-06-01', endDate: '2024-12-31', budget: '₹12.5 Cr',manager: 'Anjali Nair'  },
  { id: '5', name: 'Water Treatment Plant Ext.',  location: 'Vizag, AP',        progress: 20, status: 'active',   startDate: '2024-05-01', endDate: '2026-04-30', budget: '₹6.3 Cr', manager: 'Kiran Babu'   },
];

const STATUS_COLOR = { active: COLORS.success, completed: COLORS.info, paused: COLORS.warning };

export default function ProjectListScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();

  const [projects,     setProjects]     = useState(INITIAL_PROJECTS);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal,    setShowModal]    = useState(false);

  // ── New project form state ─────────────────────────────────────────────────
  const [form, setForm] = useState({ name: '', location: '', startDate: '', endDate: '', budget: '', manager: '' });

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleAddProject() {
    if (!form.name.trim() || !form.location.trim()) {
      Alert.alert('Required', 'Project name and location are required.');
      return;
    }
    const newProject = {
      id:        Date.now().toString(),
      name:      form.name.trim(),
      location:  form.location.trim(),
      progress:  0,
      status:    'active',
      startDate: form.startDate,
      endDate:   form.endDate,
      budget:    form.budget,
      manager:   form.manager,
    };
    setProjects(prev => [newProject, ...prev]);
    setForm({ name: '', location: '', startDate: '', endDate: '', budget: '', manager: '' });
    setShowModal(false);
  }

  // ── Filter pill ────────────────────────────────────────────────────────────
  function FilterPill({ label, value }) {
    const active = filterStatus === value;
    return (
      <TouchableOpacity
        style={[styles.pill, active && styles.pillActive]}
        onPress={() => setFilterStatus(value)}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // ── Project card ───────────────────────────────────────────────────────────
  function ProjectCard({ item }) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProjectDetails', { project: item })}
      >
        <Card shadow="md" style={styles.projectCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.projectLocation}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textLight} /> {item.location}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <ProgressBar progress={item.progress} showPercent />

          <View style={styles.cardFooter}>
            <Text style={styles.metaText}>👷 {item.manager}</Text>
            <Text style={styles.metaText}>💰 {item.budget}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brand}>sitePilot</Text>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects or location..."
            placeholderTextColor={COLORS.textLight}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <View style={styles.filters}>
        <FilterPill label="All"       value="all"       />
        <FilterPill label="Active"    value="active"    />
        <FilterPill label="Completed" value="completed" />
        <FilterPill label="Paused"    value="paused"    />
      </View>

      {/* ── Count ───────────────────────────────────────────────────────── */}
      <Text style={styles.countText}>{filtered.length} project{filtered.length !== 1 ? 's' : ''} found</Text>

      {/* ── List ────────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProjectCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No projects found</Text>
          </View>
        }
      />

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>

      {/* ── Add Project Modal ────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Project</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField label="Project Name *"    value={form.name}      onChangeText={v => setForm(f => ({ ...f, name: v }))}      placeholder="e.g. Highway NH-44 Widening" />
              <InputField label="Location *"        value={form.location}  onChangeText={v => setForm(f => ({ ...f, location: v }))}  placeholder="City, State" />
              <InputField label="Start Date"        value={form.startDate} onChangeText={v => setForm(f => ({ ...f, startDate: v }))} placeholder="YYYY-MM-DD" />
              <InputField label="End Date"          value={form.endDate}   onChangeText={v => setForm(f => ({ ...f, endDate: v }))}   placeholder="YYYY-MM-DD" />
              <InputField label="Budget"            value={form.budget}    onChangeText={v => setForm(f => ({ ...f, budget: v }))}    placeholder="₹ amount" keyboardType="default" />
              <InputField label="Site Manager"      value={form.manager}   onChangeText={v => setForm(f => ({ ...f, manager: v }))}   placeholder="Full name" />
              <Button title="Create Project" onPress={handleAddProject} size="lg" style={{ marginTop: SPACING.sm }} />
              <Button title="Cancel" variant="ghost" onPress={() => setShowModal(false)} size="lg" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.background },
  header:        { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  brand:         { fontSize: FONTS.sizes.md, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  headerTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  addBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  searchRow:     { padding: SPACING.md, paddingBottom: SPACING.xs },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...SHADOW.sm },
  searchInput:   { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  filters:       { flexDirection: 'row', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  pill:          { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pillActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText:      { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textLight },
  pillTextActive:{ color: COLORS.textWhite },
  countText:     { fontSize: FONTS.sizes.xs, color: COLORS.textLight, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs },
  list:          { padding: SPACING.md, paddingTop: 0, paddingBottom: 100 },
  projectCard:   { marginBottom: SPACING.sm },
  cardHeader:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardLeft:      { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  statusDot:     { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm, marginTop: 4 },
  projectName:   { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  projectLocation:{ fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText:    { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  metaText:      { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  empty:         { alignItems: 'center', paddingTop: 80 },
  emptyText:     { fontSize: FONTS.sizes.md, color: COLORS.textLight, marginTop: SPACING.md },
  fab:           { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:    { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, maxHeight: '90%' },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle:    { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
});