import React, { useState } from 'react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import {
  IoArrowBack, IoLocationOutline, IoCalendarOutline,
  IoFlagOutline, IoCashOutline, IoPersonOutline,
  IoCheckmarkCircleOutline, IoChevronForward, IoCube,
} from 'react-icons/io5';

const TABS = ['Overview', 'Reports', 'Materials', 'Photos'];

const SAMPLE_REPORTS = [
  { id: '1', date: '2025-01-14', work: 'Completed foundation pouring – Grid B3 to B7', workers: 24, submittedBy: 'Ravi Kumar' },
  { id: '2', date: '2025-01-13', work: 'Formwork removal & scaffolding setup Level 2',   workers: 18, submittedBy: 'Suresh M' },
  { id: '3', date: '2025-01-12', work: 'Concrete curing – Level 1 slabs inspected',       workers: 12, submittedBy: 'Ravi Kumar' },
];

const SAMPLE_MATERIALS = [
  { id: '1', name: 'Cement (OPC 53)',  quantity: 480,  unit: 'Bags',   status: 'ok'  },
  { id: '2', name: 'TMT Steel Bars',   quantity: 12,   unit: 'Tonnes', status: 'low' },
  { id: '3', name: 'River Sand',       quantity: 220,  unit: 'Cft',    status: 'ok'  },
  { id: '4', name: 'Coarse Aggregate', quantity: 5,    unit: 'Tonnes', status: 'low' },
  { id: '5', name: 'Bricks (Class A)', quantity: 8400, unit: 'Nos',    status: 'ok'  },
];

const SAMPLE_PHOTOS = [
  { id: '1', uri: 'https://picsum.photos/seed/site1/400/300', note: 'Foundation work – Grid B3', date: '2025-01-14' },
  { id: '2', uri: 'https://picsum.photos/seed/site2/400/300', note: 'Steel reinforcement Level 1', date: '2025-01-13' },
  { id: '3', uri: 'https://picsum.photos/seed/site3/400/300', note: 'Concrete pour complete',      date: '2025-01-12' },
  { id: '4', uri: 'https://picsum.photos/seed/site4/400/300', note: 'Scaffolding setup Level 2',   date: '2025-01-11' },
];

const ICON_MAP = {
  'location-outline':           <IoLocationOutline size={18} />,
  'calendar-outline':           <IoCalendarOutline size={18} />,
  'flag-outline':               <IoFlagOutline size={18} />,
  'cash-outline':               <IoCashOutline size={18} />,
  'person-outline':             <IoPersonOutline size={18} />,
  'checkmark-circle-outline':   <IoCheckmarkCircleOutline size={18} />,
};

export default function ProjectDetail({ navigate, project }) {
  const [activeTab, setActiveTab] = useState('Overview');

  function InfoRow({ icon, label, value }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: `${SPACING.sm}px 0`,
        borderBottom: `1px solid ${COLORS.border}`,
        gap: SPACING.sm,
      }}>
        <span style={{ color: COLORS.primary, width: 28, display: 'flex' }}>
          {ICON_MAP[icon]}
        </span>
        <span style={{ flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textLight, fontWeight: '600' }}>{label}</span>
        <span style={{ fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '700' }}>{value}</span>
      </div>
    );
  }

  // ── Tab: Overview ────────────────────────────────────────────────────────
  function OverviewTab() {
    return (
      <div style={s.tabContent}>
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <div style={s.cardTitle}>Project Progress</div>
          <ProgressBar progress={project?.progress || 0} showPercent />
          <div style={s.statsGrid}>
            {[
              { label: 'Days Left',     value: '168', color: COLORS.primary },
              { label: 'Tasks Done',    value: '34',  color: COLORS.success },
              { label: 'Reports Filed', value: '21',  color: COLORS.info    },
              { label: 'Alerts',        value: '2',   color: COLORS.danger  },
            ].map(stat => (
              <div key={stat.label} style={s.statBox}>
                <span style={{ fontSize: FONTS.sizes.xxl || 28, fontWeight: '900', color: stat.color }}>{stat.value}</span>
                <span style={{ fontSize: FONTS.sizes.xs, color: COLORS.textLight, fontWeight: '600', marginTop: 2 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <div style={s.cardTitle}>Details</div>
          <InfoRow icon="location-outline"        label="Location"  value={project?.location  || '–'} />
          <InfoRow icon="calendar-outline"        label="Start Date" value={project?.startDate || '2024-01-10'} />
          <InfoRow icon="flag-outline"            label="End Date"   value={project?.endDate   || '2025-06-30'} />
          <InfoRow icon="cash-outline"            label="Budget"     value={project?.budget    || '₹4.2 Cr'} />
          <InfoRow icon="person-outline"          label="Manager"    value={project?.manager   || 'Ravi Kumar'} />
          <InfoRow icon="checkmark-circle-outline" label="Status"   value={(project?.status || 'active').toUpperCase()} />
        </Card>

        <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.sm }}>
          <div style={{ flex: 1 }}>
            <Button label="New Report"   onClick={() => navigate && navigate('DailyReport')} />
          </div>
          <div style={{ flex: 1 }}>
            <Button label="Add Material" onClick={() => navigate && navigate('MaterialEntry')} variant="outline" />
          </div>
        </div>
      </div>
    );
  }

  // ── Tab: Reports ─────────────────────────────────────────────────────────
  function ReportsTab() {
    return (
      <div style={s.tabContent}>
        <Button label="+ New Daily Report" onClick={() => navigate && navigate('DailyReport')} style={{ marginBottom: SPACING.md }} />
        {SAMPLE_REPORTS.map(item => (
          <Card key={item.id} style={{ padding: SPACING.md, marginBottom: SPACING.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
              <div style={s.dateBadge}>
                <span style={{ fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.primary, lineHeight: 1 }}>
                  {item.date.split('-')[2]}
                </span>
                <span style={{ fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' }}>
                  {new Date(item.date).toLocaleString('default', { month: 'short' })}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text }}>{item.work}</div>
                <div style={{ fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 4 }}>
                  👷 {item.workers} workers &nbsp;•&nbsp; {item.submittedBy}
                </div>
              </div>
              <IoChevronForward size={18} color={COLORS.textLight} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // ── Tab: Materials ───────────────────────────────────────────────────────
  function MaterialsTab() {
    return (
      <div style={s.tabContent}>
        <Button label="+ Add Material" onClick={() => navigate && navigate('MaterialEntry')} style={{ marginBottom: SPACING.md }} />
        {SAMPLE_MATERIALS.map(item => {
          const isLow = item.status === 'low';
          return (
            <Card key={item.id} style={{ padding: SPACING.md, marginBottom: SPACING.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
                <div style={{
                  width: 44, height: 44, borderRadius: RADIUS.md,
                  backgroundColor: isLow ? (COLORS.danger + '22') : (COLORS.success + '22'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IoCube size={22} color={isLow ? COLORS.danger : COLORS.success} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text }}>{item.name}</div>
                  <div style={{ fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 }}>{item.quantity} {item.unit}</div>
                </div>
                {isLow && (
                  <span style={{
                    backgroundColor: COLORS.danger + '22',
                    color: COLORS.danger,
                    fontSize: 10, fontWeight: '800',
                    padding: '3px 8px', borderRadius: 99,
                  }}>LOW</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // ── Tab: Photos ──────────────────────────────────────────────────────────
  function PhotosTab() {
    return (
      <div style={s.tabContent}>
        <Button label="+ Add Photo" onClick={() => navigate && navigate('Photos')} style={{ marginBottom: SPACING.md }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.sm }}>
          {SAMPLE_PHOTOS.map(p => (
            <div key={p.id} style={{
              width: 'calc(50% - 6px)',
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.md,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              <img src={p.uri} alt={p.note} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '8px 8px 2px', fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.text }}>{p.note}</div>
              <div style={{ padding: '0 8px 8px', fontSize: 10, color: COLORS.textLight }}>{p.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabContent = {
    Overview:  <OverviewTab />,
    Reports:   <ReportsTab />,
    Materials: <MaterialsTab />,
    Photos:    <PhotosTab />,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate && navigate('dashboard')}>
          <IoArrowBack size={24} color="#fff" />
        </button>
        <div style={{ flex: 1, marginLeft: SPACING.sm, overflow: 'hidden' }}>
          <div style={{ fontSize: FONTS.sizes.lg, fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project?.name || 'Project Details'}
          </div>
          <div style={{ fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)' }}>{project?.location}</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab}
            style={{
              ...s.tabBtn,
              borderBottom: `3px solid ${activeTab === tab ? COLORS.primary : 'transparent'}`,
              color: activeTab === tab ? COLORS.primary : COLORS.textLight,
              fontWeight: activeTab === tab ? '800' : '600',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, backgroundColor: COLORS.background, overflowY: 'auto', maxWidth: 720, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}

const s = {
  header: {
    backgroundColor: COLORS.primary,
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    padding: `${SPACING.sm}px ${SPACING.md}px ${SPACING.md}px`,
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center',
  },
  tabBar: {
    display: 'flex', flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tabBtn: {
    flex: 1, padding: `${SPACING.md}px 0`,
    background: 'none', border: 'none', borderBottom: '3px solid transparent',
    cursor: 'pointer', fontSize: FONTS.sizes.sm,
    transition: 'color 0.15s',
  },
  tabContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md, fontWeight: '800',
    color: COLORS.text, marginBottom: SPACING.md,
  },
  statsGrid: {
    display: 'flex', flexWrap: 'wrap',
    gap: SPACING.sm, marginTop: SPACING.md,
  },
  statBox: {
    flex: '1 1 45%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, padding: SPACING.md,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  dateBadge: {
    width: 44, height: 52,
    backgroundColor: COLORS.primary + '22',
    borderRadius: RADIUS.sm,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
};