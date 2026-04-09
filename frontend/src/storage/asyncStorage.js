import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get(key)        { try { const v=await AsyncStorage.getItem(key); return v?JSON.parse(v):null; } catch{return null;} },
  async set(key,value)  { try { await AsyncStorage.setItem(key,JSON.stringify(value)); return true; } catch{return false;} },
  async remove(key)     { try { await AsyncStorage.removeItem(key); return true; } catch{return false;} },
};

export const offlineStorage = {
  cacheProjects:  projects  => storage.set('cached_projects',  projects),
  getCachedProjects:         () => storage.get('cached_projects') .then(d=>d||[]),
  cacheMaterials: materials => storage.set('cached_materials', materials),
  getCachedMaterials:        () => storage.get('cached_materials').then(d=>d||[]),
};