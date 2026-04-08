import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppContext, ACTIONS } from '../context/AppContext';
import Card   from '../components/Card';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const STATS = [
  { label: 'Projects',  value: '5',  icon: 'briefcase',    color: COLORS.primary },
  { label: 'Reports',   value: '47', icon: 'document-text', color: COLORS.success },
  { label: 'Photos',    value: '128',icon: 'camera',        color: COLORS.info    },
  { label: 'Materials', value: '32', icon: 'cube',          color: COLORS.warning },
];

export default function ProfileScreen() {
  const navigation     = useNavigation();
  const { state, dispatch } = useAppContext();
  const insets         = useSafeAreaInsets();

  const user = state.user || {
    name:    'Ravi Kumar',
    email:   'ravi@sitepilot.com',
    company: 'Kumar Constructions Pvt. Ltd.',
    role:    'Site Engineer',
    phone:   '+91 98765 43210',
    location:'Hyderabad, Telangana',
  };

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [offlineMode,  setOfflineMode]  = useState(false);

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from sitePilot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
            dispatch({ type: ACTIONS.LOGOUT });
          },
        },
      ]
    );
  }

  function MenuItem({ icon, label, value, onPress, danger, toggle, toggleValue, onToggle }) {
    return (
      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggle ? undefined : onPress}
        activeOpacity={toggle ? 1 : 0.7}
      >
        <View style={[styles.menuIcon, { backgroundColor: danger ? COLORS.danger + '15' : COLORS.primary + '10' }]}>
          <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
          {value && <Text style={styles.menuValue}>{value}</Text>}
        </View>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ true: COLORS.primary, false: COLORS.border }}
            thumbColor="#fff"
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={danger ? COLORS.danger : COLORS.textLight} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Avatar + Info ────────────────────────────────────────────── */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color={COLORS.textWhite} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
          <Text style={styles.company}>{user.company}</Text>
        </View>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={[styles.statChip, SHADOW.sm]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Contact info ─────────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>CONTACT INFORMATION</Text>
          {[
            { icon: 'mail-outline',     label: user.email    },
            { icon: 'call-outline',     label: user.phone    },
            { icon: 'location-outline', label: user.location },
          ].map((item, idx) => (
            <View key={idx} style={styles.infoRow}>
              <Ionicons name={item.icon} size={18} color={COLORS.primary} style={{ width: 28 }} />
              <Text style={styles.infoText}>{item.label || '—'}</Text>
            </View>
          ))}
        </Card>

        {/* ── Settings ─────────────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>APP SETTINGS</Text>
          <MenuItem icon="notifications-outline" label="Push Notifications" toggle toggleValue={notifEnabled} onToggle={setNotifEnabled} />
          <MenuItem icon="cloud-offline-outline" label="Offline Mode"        toggle toggleValue={offlineMode}  onToggle={setOfflineMode}  value="Save data locally" />
          <MenuItem icon="language-outline"      label="Language"            value="English (India)"  onPress={() => {}} />
          <MenuItem icon="color-palette-outline" label="Theme"               value="Light"            onPress={() => {}} />
        </Card>

        {/* ── App options ───────────────────────────────────────────────── */}
        <Card shadow="sm">
          <Text style={styles.sectionLabel}>MORE OPTIONS</Text>
          <MenuItem icon="help-circle-outline"  label="Help & Support"    onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Terms of Service"  onPress={() => {}} />
          <MenuItem icon="shield-outline"        label="Privacy Policy"    onPress={() => {}} />
          <MenuItem icon="star-outline"          label="Rate App"          onPress={() => {}} />
          <MenuItem icon="share-outline"         label="Share sitePilot"   onPress={() => {}} />
        </Card>

        {/* ── App version ──────────────────────────────────────────────── */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>sitePilot v1.0.0  •  Build 100</Text>
          <Text style={styles.versionSub}>Made with ❤️ for construction teams</Text>
        </View>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <Button
          title="Logout"
          variant="danger"
          size="lg"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color={COLORS.textWhite} />}
          style={{ marginBottom: SPACING.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.background },
  header:        { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  backBtn:       { padding: 4 },
  headerTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  editBtn:       { padding: 4 },
  scroll:        { padding: SPACING.md, paddingBottom: 40 },
  profileHero:   { alignItems: 'center', paddingVertical: SPACING.lg },
  avatarWrap:    { position: 'relative', marginBottom: SPACING.md },
  avatar:        { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
  avatarText:    { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textWhite },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.surface },
  userName:      { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.text },
  roleBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  roleText:      { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  company:       { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: SPACING.xs },
  statsRow:      { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statChip:      { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', gap: 4 },
  statValue:     { fontSize: FONTS.sizes.lg, fontWeight: '900' },
  statLabel:     { fontSize: 10, color: COLORS.textLight, fontWeight: '700' },
  sectionLabel:  { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  infoRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoText:      { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '500' },
  menuItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon:      { width: 38, height: 38, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel:     { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  menuValue:     { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  versionRow:    { alignItems: 'center', paddingVertical: SPACING.md },
  versionText:   { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  versionSub:    { fontSize: FONTS.sizes.xs, color: COLORS.border, marginTop: 2 },
});