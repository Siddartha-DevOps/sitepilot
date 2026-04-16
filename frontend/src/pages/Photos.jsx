import React, { useState } from "react";
import {
  CloudUpload, Camera, Image as ImageIcon, XCircle, Plus, Briefcase, CheckCircle, Circle,
} from "lucide-react";

import Button from "../components/Button";
import Card from "../components/Card";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../constants/theme";

const THUMB = 150;

const PROJECTS = [
  "Highway NH-44 Widening",
  "Commercial Complex Block A",
  "Residential Colony Phase 2",
  "Water Treatment Plant Ext.",
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
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [note, setNote] = useState('');
  const [project, setProject] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleCamera() {
    alert("Camera upload not available on web. Use gallery instead.");
  }

  async function handleGallery() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = e => {
      const files = Array.from(e.target.files);
      const newPhotos = files.map(f => ({ uri: URL.createObjectURL(f), note: "" }));
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    };
    input.click();
  }

  function removePhoto(idx) {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (!project) { alert("Please select a project."); return; }
    if (selectedPhotos.length === 0) { alert("Please select at least one photo."); return; }

    setUploading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      alert(`${selectedPhotos.length} photo(s) uploaded successfully.`);
      setSelectedPhotos([]);
      setNote('');
      setProject('');
    } catch {
      alert("Upload failed. Photos saved locally.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.brand}>sitePilot</div>
        <div style={styles.headerTitle}>Photos</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.scroll}>
        {/* Upload zone */}
        <Card shadow="md">
          <div style={styles.sectionLabel}>ADD NEW PHOTOS</div>

          {/* Camera / Gallery buttons */}
          <div style={styles.uploadBtns}>
            <button style={styles.uploadBtn} onClick={handleCamera}>
              <div style={styles.uploadIcon}><Camera size={36} color={COLORS.primary} /></div>
              <div style={styles.uploadBtnTitle}>Take Photo</div>
              <div style={styles.uploadBtnSub}>Use camera</div>
            </button>

            <button style={styles.uploadBtn} onClick={handleGallery}>
              <div style={{...styles.uploadIcon, backgroundColor: COLORS.info + '15'}}><ImageIcon size={36} color={COLORS.info} /></div>
              <div style={styles.uploadBtnTitle}>Upload Photos</div>
              <div style={styles.uploadBtnSub}>From gallery</div>
            </button>
          </div>

          {/* Selected photos */}
          {selectedPhotos.length > 0 ? (
            <div style={styles.selectedGrid}>
              {selectedPhotos.map((p, idx) => (
                <div key={idx} style={styles.selectedThumb}>
                  <img src={p.uri} alt="" style={{ width: THUMB, height: THUMB * 0.75, borderRadius: RADIUS.sm }} />
                  <button style={styles.removeBtn} onClick={() => removePhoto(idx)}>
                    <XCircle size={24} color={COLORS.danger} />
                  </button>
                </div>
              ))}
              <button style={{...styles.addMoreThumb, width: THUMB, height: THUMB*0.75}} onClick={handleGallery}>
                <Plus size={30} color={COLORS.primary} />
                <div style={styles.addMoreText}>More</div>
              </button>
            </div>
          ) : (
            <div style={styles.dropZone}>
              <CloudUpload size={48} color={COLORS.border} />
              <div style={styles.dropZoneText}>No photos selected</div>
              <div style={styles.dropSub}>Tap camera or upload above</div>
            </div>
          )}
        </Card>

        {/* Photo details */}
        {selectedPhotos.length > 0 && (
          <Card shadow="sm">
            <div style={styles.sectionLabel}>PHOTO DETAILS</div>
            <div style={styles.fieldLabel}>Project *</div>
            <button style={styles.pickerBtn} onClick={() => setShowPicker(v => !v)}>
              <Briefcase size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <span style={project ? styles.pickerText : styles.pickerPH}>{project || 'Select project...'}</span>
              <span>{showPicker ? '▲' : '▼'}</span>
            </button>
            {showPicker && (
              <div style={styles.dropdown}>
                {PROJECTS.map(p => (
                  <button key={p} style={styles.dropItem} onClick={() => { setProject(p); setShowPicker(false); }}>
                    {project === p ? <CheckCircle size={18} color={COLORS.primary}/> : <Circle size={18} color={COLORS.primary}/>}
                    <span style={styles.dropItemText}>{p}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Notes */}
            <div style={{...styles.fieldLabel, marginTop: SPACING.md}}>Notes / Caption</div>
            <textarea
              style={styles.noteInput}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe what's in these photos..."
            />

            <Button
              title={`Upload ${selectedPhotos.length} Photo${selectedPhotos.length>1?'s':''}`}
              onPress={handleUpload}
              loading={uploading}
              size="lg"
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        )}

        {/* Recent Photos */}
        <div style={styles.sectionTitle}>Recent Photos</div>
        <div style={styles.recentGrid}>
          {RECENT_PHOTOS.map(p => (
            <div key={p.id} style={styles.recentCard}>
              <img src={p.uri} alt="" style={{ width: THUMB, height: THUMB*0.75 }} />
              <div style={styles.recentInfo}>
                <div style={styles.recentNote}>{p.note}</div>
                <div style={styles.recentProject}>{p.project} • {p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Styles (converted from React Native StyleSheet)
const styles = {
  root: { backgroundColor: COLORS.background, minHeight: '100vh', padding: SPACING.md },
  header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  brand: { fontSize: FONTS.sizes.md, fontWeight: 900, color: 'rgba(255,255,255,0.7)' },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: 800, color: COLORS.textWhite },
  scroll: { display: 'flex', flexDirection: 'column', gap: SPACING.md },
  sectionLabel: { fontSize: FONTS.sizes.xs, fontWeight: 800, color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 800, color: COLORS.secondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  uploadBtns: { display: 'flex', flexDirection: 'row', gap: SPACING.md },
  uploadBtn: { flex: 1, borderWidth: '1.5px', borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, padding: SPACING.md, textAlign: 'center', backgroundColor: 'white' },
  uploadIcon: { width: 64, height: 64, borderRadius: RADIUS.md, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, backgroundColor: COLORS.primary+'15' },
  uploadBtnTitle: { fontSize: FONTS.sizes.md, fontWeight: 700, color: COLORS.text },
  uploadBtnSub: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  selectedGrid: { display: 'flex', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  selectedThumb: { position: 'relative' },
  removeBtn: { position: 'absolute', top: -10, right: -10, border: 'none', background: 'transparent', cursor: 'pointer' },
  addMoreThumb: { border: `2px dashed ${COLORS.primary}`, borderRadius: RADIUS.sm, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
  addMoreText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: 700 },
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: SPACING.xl, border: `2px dashed ${COLORS.border}`, borderRadius: RADIUS.md },
  dropZoneText: { fontSize: FONTS.sizes.md, fontWeight: 600, color: COLORS.textLight, marginTop: 8 },
  dropSub: { fontSize: FONTS.sizes.xs, color: COLORS.border, marginTop: 4 },
  fieldLabel: { fontSize: FONTS.sizes.sm, fontWeight: 600, color: COLORS.secondary, marginBottom: SPACING.xs },
  pickerBtn: { display: 'flex', flexDirection: 'row', alignItems: 'center', borderWidth: '1.5px', borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, backgroundColor: COLORS.surface, cursor: 'pointer' },
  pickerText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  pickerPH: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textLight },
  dropdown: { borderWidth: '1px', borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: 4, backgroundColor: COLORS.surface, overflow: 'hidden' },
  dropItem: { display: 'flex', alignItems: 'center', padding: SPACING.md, borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer' },
  dropItemText: { fontSize: FONTS.sizes.sm, color: COLORS.text, marginLeft: SPACING.sm },
  noteInput: { width: '100%', minHeight: 80, fontSize: FONTS.sizes.md, color: COLORS.text, padding: SPACING.md, border: `1.5px solid ${COLORS.border}`, borderRadius: RADIUS.md, resize: 'vertical' },
  recentGrid: { display: 'flex', flexWrap: 'wrap', gap: SPACING.sm },
  recentCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', width: THUMB, ...SHADOW.sm },
  recentInfo: { padding: 6 },
  recentNote: { fontSize: FONTS.sizes.xs, fontWeight: 600, color: COLORS.text },
  recentProject: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
};
