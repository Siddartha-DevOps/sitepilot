import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import {
  IoArrowBack,
  IoChevronDown, IoChevronUp,
  IoCheckmarkCircle, IoEllipseOutline,
  IoCalendarOutline, IoConstructOutline,
  IoPeopleOutline, IoCubeOutline,
  IoDocumentTextOutline, IoCamera,
  IoImage, IoCloseCircle, IoCameraOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

const PROJECTS = [
  'Highway NH-44 Widening',
  'Commercial Complex Block A',
  'Residential Colony Phase 2',
  'Water Treatment Plant Ext.',
];

export default function DailyReport({ navigate, prefillProject }) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    project:   prefillProject || '',
    date:      today,
    workDone:  '',
    workers:   '',
    materials: '',
    notes:     '',
  });

  const [photos, setPhotos]                     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // ── Photo handling ──────────────────────────────────────────────────────
  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    const urls  = files.map(f => URL.createObjectURL(f));
    setPhotos(prev => [...prev, ...urls]);
    e.target.value = '';
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.project)  { alert('Please select a project.');              return; }
    if (!form.workDone) { alert('Please describe the work completed.');   return; }
    if (!form.workers)  { alert('Please enter worker count.');            return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200)); // replace with real API call
      alert('Daily report submitted successfully ✅');
      if (navigate) navigate('dashboard');
    } catch {
      alert('Failed to submit report.');
    } finally {
      setLoading(false);
    }
  }

  // ── Styles (inline) ─────────────────────────────────────────────────────
  const s = {
    root: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    },
    header: {
      backgroundColor: COLORS.primary,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${SPACING.sm}px ${SPACING.md}px ${SPACING.md}px`,
    },
    headerTitle: {
      fontSize: FONTS.sizes.xl,
      fontWeight: '800',
      color: '#fff',
    },
    backBtn: {
      cursor: 'pointer',
      padding: 4,
      background: 'none',
      border: 'none',
    },
    scroll: {
      maxWidth: 680,
      margin: '0 auto',
      padding: SPACING.md,
      paddingBottom: 40,
    },
    sectionLabel: {
      fontSize: FONTS.sizes.xs,
      fontWeight: '800',
      color: COLORS.textLight,
      letterSpacing: 1,
      marginBottom: SPACING.md,
      textTransform: 'uppercase',
    },
    fieldLabel: {
      fontSize: FONTS.sizes.sm,
      fontWeight: '600',
      color: COLORS.secondary,
      marginBottom: SPACING.xs,
      display: 'block',
    },
    pickerBtn: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: `1.5px solid ${COLORS.border}`,
      borderRadius: RADIUS.md,
      padding: `${SPACING.sm + 2}px ${SPACING.md}px`,
      marginBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      cursor: 'pointer',
    },
    dropdown: {
      border: `1px solid ${COLORS.border}`,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      overflow: 'hidden',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      padding: SPACING.md,
      borderBottom: `1px solid ${COLORS.border}`,
      cursor: 'pointer',
      gap: SPACING.sm,
    },
    photoActions: {
      display: 'flex',
      gap: SPACING.md,
    },
    photoBtn: {
      flex: 1,
      border: `2px dashed ${COLORS.border}`,
      borderRadius: RADIUS.md,
      padding: `${SPACING.lg}px`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      background: 'none',
    },
    photosRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },
    photoThumb: {
      position: 'relative',
      width: 90,
      height: 90,
    },
    thumbImg: {
      width: 90,
      height: 90,
      borderRadius: RADIUS.md,
      objectFit: 'cover',
    },
    removeBtn: {
      position: 'absolute',
      top: -8,
      right: -8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
    },
    noPhotos: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${SPACING.lg}px 0`,
      gap: 8,
    },
    noPhotosText: {
      fontSize: FONTS.sizes.sm,
      color: COLORS.textLight,
    },
    textarea: {
      width: '100%',
      border: `1.5px solid ${COLORS.border}`,
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      fontSize: FONTS.sizes.md,
      color: COLORS.text,
      backgroundColor: COLORS.surface,
      resize: 'vertical',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      marginBottom: SPACING.md,
    },
    draftBtn: {
      marginBottom: SPACING.xl,
    },
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate && navigate('dashboard')}>
          <IoArrowBack size={24} color="#fff" />
        </button>
        <span style={s.headerTitle}>Daily Report</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={s.scroll}>

        {/* ── Project Details ─────────────────────────────────────────── */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <div style={s.sectionLabel}>Project Details</div>

          <label style={s.fieldLabel}>Project *</label>
          <div style={s.pickerBtn} onClick={() => setShowProjectPicker(v => !v)}>
            <span style={{ fontSize: FONTS.sizes.md, color: form.project ? COLORS.text : COLORS.textLight }}>
              {form.project || 'Select project...'}
            </span>
            {showProjectPicker
              ? <IoChevronUp size={20} color={COLORS.textLight} />
              : <IoChevronDown size={20} color={COLORS.textLight} />
            }
          </div>

          {showProjectPicker && (
            <div style={s.dropdown}>
              {PROJECTS.map(p => (
                <div
                  key={p}
                  style={s.dropdownItem}
                  onClick={() => { setField('project', p); setShowProjectPicker(false); }}
                >
                  {form.project === p
                    ? <IoCheckmarkCircle size={18} color={COLORS.primary} />
                    : <IoEllipseOutline size={18} color={COLORS.textLight} />
                  }
                  <span style={{ fontSize: FONTS.sizes.sm, color: COLORS.text }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          <InputField
            label="Date *"
            value={form.date}
            onChange={e => setField('date', e.target.value)}
            type="date"
            icon={<IoCalendarOutline size={20} color={COLORS.textLight} />}
          />
        </Card>

        {/* ── Work Details ─────────────────────────────────────────────── */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <div style={s.sectionLabel}>Work Details</div>

          <label style={s.fieldLabel}>Work Completed *</label>
          <textarea
            style={s.textarea}
            rows={4}
            value={form.workDone}
            onChange={e => setField('workDone', e.target.value)}
            placeholder="Describe today's work in detail..."
          />

          <InputField
            label="Workers on Site *"
            value={form.workers}
            onChange={e => setField('workers', e.target.value)}
            placeholder="e.g. 24"
            type="number"
            icon={<IoPeopleOutline size={20} color={COLORS.textLight} />}
          />

          <label style={s.fieldLabel}>Materials Used</label>
          <textarea
            style={s.textarea}
            rows={3}
            value={form.materials}
            onChange={e => setField('materials', e.target.value)}
            placeholder="e.g. 40 bags cement, 2T steel..."
          />

          <label style={s.fieldLabel}>Additional Notes</label>
          <textarea
            style={s.textarea}
            rows={3}
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Issues, observations, next steps..."
          />
        </Card>

        {/* ── Progress Photos ──────────────────────────────────────────── */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <div style={s.sectionLabel}>Progress Photos</div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={s.photoActions}>
            <button style={s.photoBtn} onClick={() => cameraInputRef.current.click()}>
              <IoCamera size={26} color={COLORS.primary} />
              <span style={{ fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary }}>
                Take Photo
              </span>
            </button>
            <button style={s.photoBtn} onClick={() => fileInputRef.current.click()}>
              <IoImage size={26} color={COLORS.info || COLORS.secondary} />
              <span style={{ fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.info || COLORS.secondary }}>
                Upload
              </span>
            </button>
          </div>

          {photos.length > 0 ? (
            <div style={s.photosRow}>
              {photos.map((url, idx) => (
                <div key={idx} style={s.photoThumb}>
                  <img src={url} alt={`photo-${idx}`} style={s.thumbImg} />
                  <button style={s.removeBtn} onClick={() => removePhoto(idx)}>
                    <IoCloseCircle size={22} color={COLORS.danger || '#e53e3e'} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.noPhotos}>
              <IoCameraOutline size={40} color={COLORS.border} />
              <span style={s.noPhotosText}>No photos added yet</span>
            </div>
          )}
        </Card>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <Button
          label={loading ? 'Submitting...' : 'Submit Daily Report'}
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginBottom: SPACING.sm }}
          icon={<IoCheckmarkCircleOutline size={20} color="#fff" />}
        />
        <Button
          label="Save as Draft"
          variant="outline"
          onClick={() => alert('Draft saved locally.')}
          style={s.draftBtn}
        />

      </div>
    </div>
  );
}