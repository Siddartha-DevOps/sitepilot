import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Generic helpers ────────────────────────────────────────────────────────────
export const storage = {
  async get(key) {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch { return false; }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch { return false; }
  },
};

// ── Domain helpers ─────────────────────────────────────────────────────────────
export const offlineStorage = {
  // Cache projects for offline use
  async cacheProjects(projects) { return storage.set('cached_projects', projects); },
  async getCachedProjects()     { return storage.get('cached_projects') || []; },

  // Cache materials
  async cacheMaterials(materials) { return storage.set('cached_materials', materials); },
  async getCachedMaterials()      { return storage.get('cached_materials') || []; },

  // Queue reports created offline
  async queueReport(report) {
    const queue = (await storage.get('offline_reports')) || [];
    queue.push({ ...report, _offline: true, _createdAt: Date.now() });
    return storage.set('offline_reports', queue);
  },
  async getQueuedReports() { return storage.get('offline_reports') || []; },
  async clearReportQueue() { return storage.remove('offline_reports'); },
};