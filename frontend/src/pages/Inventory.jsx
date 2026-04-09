import React, { useState } from 'react';
import { IoCubeOutline, IoAdd, IoWarning, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const INVENTORY = [
  { id:'1',  name:'Cement (OPC 53)',   qty:480,  unit:'Bags',   min:100, project:'NH-44', lastDelivery:'2025-01-12', supplier:'Ramco Cements' },
  { id:'2',  name:'TMT Steel Bars',    qty:8,    unit:'Tonnes', min:10,  project:'NH-44', lastDelivery:'2025-01-10', supplier:'TATA Steel' },
  { id:'3',  name:'River Sand',        qty:220,  unit:'Cft',    min:50,  project:'Block A', lastDelivery:'2025-01-08', supplier:'Local Quarry' },
  { id:'4',  name:'Coarse Aggregate',  qty:4,    unit:'Tonnes', min:8,   project:'Block A', lastDelivery:'2025-01-05', supplier:'Apex Agg.' },
  { id:'5',  name:'Bricks (Class A)',  qty:8400, unit:'Nos',    min:1000,project:'Colony Ph2', lastDelivery:'2025-01-14', supplier:'BM Bricks' },
  { id:'6',  name:'Fly Ash',           qty:60,   unit:'Bags',   min:20,  project:'WTP Ext.', lastDelivery:'2025-01-11', supplier:'Fly Ash Corp' },
  { id:'7',  name:'Plywood Sheets',    qty:35,   unit:'Nos',    min:15,  project:'NH-44', lastDelivery:'2025-01-09', supplier:'Ply World' },
  { id:'8',  name:'PVC Pipes (4")',    qty:2,    unit:'Rmt',    min:10,  project:'WTP Ext.', lastDelivery:'2025-01-13', supplier:'Supreme Pipe' },
  { id:'9',  name:'Electrical Cable',  qty:180,  unit:'Meters', min:50,  project:'Block A', lastDelivery:'2025-01-07', supplier:'Polycab' },
];

function getStockStatus(qty, min) {
  if (qty <= min * 0.5) return 'critical';
  if (qty <= min) return 'low';
  return 'ok';
}

const STATUS_CONFIG = {
  ok:       { color: COLORS.success, label: 'OK',       icon: <IoCheckmarkCircle /> },
  low:      { color: COLORS.warning, label: 'LOW',      icon: <IoWarning /> },
  critical: { color: COLORS.danger,  label: 'CRITICAL', icon: <IoAlertCircle /> },
};

export default function MaterialInventoryScreen({ navigate }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const enriched = INVENTORY.map(m => ({ ...m, status: getStockStatus(m.qty, m.min) }));

  const filtered = enriched.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.project.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterType === 'all' || m.status === filterType;
    return matchSearch && matchFilter;
  });

  const lowCount = enriched.filter(m => m.status === 'low').length;
  const criticalCount = enriched.filter(m => m.status === 'critical').length;

  function SummaryPill({ label, value, color }) {
    return (
      <div style={{ flex: 1, border: `1.5px solid ${color}`, borderRadius: RADIUS.md, padding: SPACING.sm, display:'flex', flexDirection:'column', alignItems:'center', backgroundColor: COLORS.surface }}>
        <span style={{ fontSize: FONTS.sizes.xl, fontWeight: 900, color }}>{value}</span>
        <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700, marginTop: 2 }}>{label}</span>
      </div>
    );
  }

  function FilterPill({ label, value }) {
    const active = filterType === value;
    return (
      <button
        style={{
          padding: '6px 12px',
          borderRadius: RADIUS.full,
          border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
          backgroundColor: active ? COLORS.primary : COLORS.surface,
          fontSize: FONTS.sizes.xs,
          fontWeight: 700,
          color: active ? COLORS.textWhite : COLORS.textLight,
          marginRight: SPACING.xs,
          cursor: 'pointer'
        }}
        onClick={() => setFilterType(value)}
      >
        {label}
      </button>
    );
  }

  function MaterialCard({ item }) {
    const cfg = STATUS_CONFIG[item.status];
    const pctLeft = Math.round((item.qty / (item.min * 3)) * 100);
    return (
      <Card shadow="sm" style={{ marginBottom: SPACING.sm }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom: SPACING.sm }}>
          <div style={{ width:48, height:48, borderRadius:RADIUS.md, backgroundColor: cfg.color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IoCubeOutline size={24} color={cfg.color} />
          </div>
          <div style={{ flex:1, marginLeft: SPACING.md }}>
            <span style={{ fontSize: FONTS.sizes.md, fontWeight:700, color: COLORS.text }}>{item.name}</span>
            <span style={{ fontSize: FONTS.sizes.xs, color: COLORS.textLight, display:'block' }}>📍 {item.project}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:RADIUS.full, backgroundColor: cfg.color+'15' }}>
            {cfg.icon}
            <span style={{ fontSize:10, fontWeight:800, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>
        <div style={{ height:6, borderRadius:RADIUS.full, backgroundColor: COLORS.border, overflow:'hidden', marginBottom:SPACING.sm }}>
          <div style={{ width: `${Math.min(100,pctLeft)}%`, height:'100%', backgroundColor: cfg.color, borderRadius:RADIUS.full }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:FONTS.sizes.sm, color: COLORS.text, fontWeight:600 }}><b style={{ color: cfg.color }}>{item.qty}</b> {item.unit} in stock</span>
          <span style={{ fontSize:FONTS.sizes.xs, color: COLORS.textLight }}>Min: {item.min} {item.unit}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:SPACING.sm, borderTop:`1px solid ${COLORS.border}` }}>
          <span style={{ fontSize:FONTS.sizes.xs, color: COLORS.textLight }}>🏭 {item.supplier}</span>
          <span style={{ fontSize:FONTS.sizes.xs, color: COLORS.textLight }}>📦 {item.lastDelivery}</span>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: SPACING.lg }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:SPACING.md }}>
        <span style={{ fontSize:FONTS.sizes.md, fontWeight:900, color:'rgba(255,255,255,0.7)' }}>sitePilot</span>
        <span style={{ fontSize:FONTS.sizes.xl, fontWeight:800, color:COLORS.textWhite }}>Inventory</span>
        <button onClick={()=>navigate('MaterialEntry')} style={{ width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IoAdd size={24} color={COLORS.textWhite}/>
        </button>
      </div>

      {/* Alert banner */}
      {(lowCount+criticalCount)>0 && <div style={{ display:'flex', alignItems:'center', gap:SPACING.sm, padding:SPACING.sm, paddingLeft:SPACING.lg, backgroundColor:COLORS.warning+'15', borderBottom:`1px solid ${COLORS.warning}30` }}>
        <IoWarning size={18} color={COLORS.warning}/>
        <span style={{ fontWeight:700, color: