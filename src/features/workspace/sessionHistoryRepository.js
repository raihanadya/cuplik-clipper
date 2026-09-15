const RETENTION_MEDIA_MS = 24 * 60 * 60 * 1000; // 24 hours media retention

function getStorageKey(userId) {
  const uid = userId || 'guest';
  return `cuplik_sessions_${uid}`;
}

export const sessionHistoryRepository = {
  getSessions(userId) {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => {
        const createdTime = new Date(item.createdAt).getTime();
        const isMediaExpired = Date.now() - createdTime > RETENTION_MEDIA_MS;
        return {
          ...item,
          isMediaExpired,
        };
      });
    } catch (e) {
      console.warn('Failed to parse session history:', e);
      return [];
    }
  },

  addSession(userId, sessionId, extra = {}) {
    if (!sessionId || typeof window === 'undefined' || !window.localStorage) return;
    try {
      const current = this.getSessions(userId);
      const filtered = current.filter((s) => s.sessionId !== sessionId);
      const newEntry = {
        sessionId,
        createdAt: new Date().toISOString(),
        status: extra.status || extra.lastKnownStatus || 'queued',
        lastKnownStatus: extra.status || extra.lastKnownStatus || 'queued',
        template: extra.template || extra.layoutTemplate || 'slide_pembicara',
        layoutTemplate: extra.template || extra.layoutTemplate || 'slide_pembicara',
        filename: extra.filename || `Proyek Video #${sessionId.slice(0, 8)}`,
        title: extra.title || extra.filename || `Proyek Video #${sessionId.slice(0, 8)}`,
        clipCount: extra.clipCount || 0,
        ...extra,
      };

      const updated = [newEntry, ...filtered];
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save session to history:', e);
    }
  },

  updateSession(userId, sessionId, updates = {}) {
    if (!sessionId || typeof window === 'undefined' || !window.localStorage) return;
    try {
      const current = this.getSessions(userId);
      const updated = current.map((s) => {
        if (s.sessionId === sessionId) {
          const merged = { ...s, ...updates };
          if (updates.status) merged.lastKnownStatus = updates.status;
          if (updates.lastKnownStatus) merged.status = updates.lastKnownStatus;
          return merged;
        }
        return s;
      });
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update session:', e);
    }
  },

  removeSession(userId, sessionId) {
    if (!sessionId || typeof window === 'undefined' || !window.localStorage) return;
    try {
      const current = this.getSessions(userId);
      const updated = current.filter((s) => s.sessionId !== sessionId);
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove session from history:', e);
    }
  },

  clearSessions(userId) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem(getStorageKey(userId));
    } catch (e) {
      console.warn('Failed to clear session history:', e);
    }
  },
};
