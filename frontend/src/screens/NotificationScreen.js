import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const ALL_NOTIFICATIONS = [
  { id:'1',  type:'danger',  category:'material', title:'Critical Stock Alert',     message:'TMT Steel Bars are critically low (8T remaining). Minimum is 10T on NH-44 project.',    time:'10 min ago',  date:'Today',     read:false },
  { id:'2',  type:'danger',  category:'material', title:'Low Stock Warning',        message:'Coarse Aggregate below threshold on Block A project. Only 4T left, minimum is 8T.',     time:'45 min ago',  date:'Today',     read:false },
  { id:'3',  type:'success', category:'report',   title:'Report Submitted',         message:'Daily report for NH-44 Widening has been submitted by Ravi Kumar for Jan 14.',          time:'2 hrs ago',   date:'Today',     read:false },
  { id:'4',  type:'info',    category:'report',   title:'Report Submitted',         message:'Daily report for Commercial Block A submitted by Priya Sharma.',                         time:'4 hrs ago',   date:'Today',     read:true  },
  { id:'5',  type:'warning', category:'deadline', title:'Project Deadline Soon',    message:'Residential Colony Phase 2 is due in 75 days. Current progress is at 82%.',             time:'6 hrs ago',   date:'Today',     read:true  },
  { id:'6',  type:'info',    category:'material', title:'Material Delivered',       message:'480 Bags of Cement (OPC 53) delivered to NH-44 site from Ramco Cements.',               time:'Yesterday',   date:'Yesterday', read:true  },
  { id:'7',  type:'success', category:'photo',    title:'Photos Uploaded',          message:'6 progress photos uploaded for Commercial Complex Block A by Priya Sharma.',            time:'Yesterday',   date:'Yesterday', read:true  },
  { id:'8',  type:'warning', category:'deadline', title:'Task Deadline Approaching','message':'Concrete curing inspection for Level 1 slabs due in 2 days.',                         time:'2 days ago',  date:'Earlier',   read:true  },
  { id:'9',  type:'info',    category:'project',  title:'New Project Added',        message:'Water Treatment Plant Extension added to active projects. Manager: Kiran Babu.',        time:'3 days ago',  date:'Earlier',   read:true  },
  { id:'10', type:'success', category:'report',   title:'Weekly Summary Ready',     message:'Weekly project summary for the period Jan 6-12 is now available for download.',        time:'5 days ago',  date:'Earlier',   read:true  },
];

const TYPE_CONFIG = {
  danger:  { bg: COLORS.danger  + '15', border: COLORS.danger,  icon: 'alert-circle',         iconColor: COLORS.danger  },
  warning: { bg: COLORS.warning + '15', border: COLORS.warning, icon: 'warning',               iconColor: COLORS.warning },
  success: { bg: COLORS.success + '15', border: COLORS.success, icon: 'checkmark-circle',      iconColor: COLORS.success },
  info:    { bg: COLORS.info    + '15', border: COLORS.info,    icon: 'information-circle',    iconColor: COLORS.info    },
};

const CATEGORY_ICONS = {
  material: 'cube-outline',
  report:   'document-text-outline',
  deadline: 'time-outline',
  photo:    'camera-outline',
  project:  'briefcase-outline',
};

const FILTERS = ['All', 'Unread', 'Material', 'Reports', 'Deadlines'];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const [filter,        setFilter]        = useState('All');
  const [refreshing,    setRefreshing]    = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'All')       return true;
    if (filter === 'Unread')    return !n.read;
    if (filter === 'Material')  return n.category === 'material';
    if (filter === 'Reports')   return n.category === 'report';
    if (filter === 'Deadlines') return n.category === 'deadline';
    return true;
  });

  // Group by date
  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function dismissNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  }

  function FilterPill({ label }) {
    const active = filter === label;
    return (
      <TouchableOpacity
        style={[styles.pill, active && styles.pillActive]}
        onPress={() => setFilter(label)}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
        {label === 'Unread' && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  function NotifCard({ item }) {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => markRead(item.id)}
        style={[styles.notifCard, !item.read && { borderLeftWidth: 4, borderLeftColor: cfg.border }]}
      >
        <View style={styles.notifRow}>
          <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={22} color={cfg.iconColor} />
          </View>
          <View style={styles.notifContent}>
            <View style={styles.notifTitleRow}>
              <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
            <View style={styles.notifFooter}>
              <Ionicons name={CATEGORY_ICONS[item.category]} size={12} color={COLORS.textLight} />
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.dismissBtn} onPress={() => dismissNotification(item.id)}>
            <Ionicons name="close" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const listData = Object.keys(grouped).flatMap(date => [
    { isHeader: true, date, id: `header-${date}` },
    ...grouped[date].map(n => ({ ...n, isHeader: false })),
  ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brand}>sitePilot</Text>
        <View style={styles.headerCentre}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 70 }} />}
      </View>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => <FilterPill key={f} label={f} />)}
      </View>

      {/* ── List ──────────────────────────────────────────────────────── */}
      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => {
          if (item.isHeader) {
            return <Text style={styles.dateHeader}>{item.date}</Text>;
          }
          return <NotifCard item={item} />;
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: COLORS.background },
  header:           { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  brand:            { fontSize: FONTS.sizes.md, fontWeight: '900', color: 'rgba(255,255,255,0.7)', width: 70 },
  headerCentre:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerTitle:      { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textWhite },
  countBadge:       { backgroundColor: COLORS.danger, borderRadius: RADIUS.full, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countBadgeText:   { fontSize: 11, fontWeight: '900', color: '#fff' },
  markAllText:      { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '700', width: 70, textAlign: 'right' },
  filterRow:        { flexDirection: 'row', gap: SPACING.xs, padding: SPACING.md, paddingBottom: SPACING.sm, flexWrap: 'wrap' },
  pill:             { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillActive:       { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText:         { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textLight },
  pillTextActive:   { color: COLORS.textWhite },
  badge:            { backgroundColor: COLORS.danger, borderRadius: RADIUS.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText:        { fontSize: 10, fontWeight: '800', color: '#fff' },
  list:             { padding: SPACING.md, paddingTop: 0, paddingBottom: 40 },
  dateHeader:       { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, letterSpacing: 0.5, marginTop: SPACING.md, marginBottom: SPACING.xs, textTransform: 'uppercase' },
  notifCard:        { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  notifRow:         { flexDirection: 'row', alignItems: 'flex-start' },
  notifIcon:        { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, flexShrink: 0 },
  notifContent:     { flex: 1 },
  notifTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  notifTitle:       { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, flex: 1 },
  notifTitleUnread: { fontWeight: '800', color: COLORS.secondary },
  unreadDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifMessage:     { fontSize: FONTS.sizes.xs, color: COLORS.textLight, lineHeight: 18 },
  notifFooter:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  notifTime:        { fontSize: 10, color: COLORS.textLight },
  dismissBtn:       { padding: 4, marginLeft: SPACING.xs },
  empty:            { alignItems: 'center', paddingTop: 80 },
  emptyTitle:       { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textLight, marginTop: SPACING.md },
  emptySub:         { fontSize: FONTS.sizes.sm, color: COLORS.border, marginTop: 4 },
});