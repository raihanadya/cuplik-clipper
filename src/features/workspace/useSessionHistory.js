import { useState, useEffect, useCallback } from 'react';
import { sessionHistoryRepository } from './sessionHistoryRepository.js';

export function useSessionHistory(userId) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSessions = useCallback(() => {
    const list = sessionHistoryRepository.getSessions(userId);
    setSessions(list);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const addSession = useCallback((sessionId, extra) => {
    sessionHistoryRepository.addSession(userId, sessionId, extra);
    refreshSessions();
  }, [userId, refreshSessions]);

  const removeSession = useCallback((sessionId) => {
    sessionHistoryRepository.removeSession(userId, sessionId);
    refreshSessions();
  }, [userId, refreshSessions]);

  const updateSession = useCallback((sessionId, updates) => {
    sessionHistoryRepository.updateSession(userId, sessionId, updates);
    refreshSessions();
  }, [userId, refreshSessions]);

  const updateSessionStatus = useCallback((sessionId, status, extra = {}) => {
    sessionHistoryRepository.updateSession(userId, sessionId, { status, ...extra });
    refreshSessions();
  }, [userId, refreshSessions]);

  const clearSessions = useCallback(() => {
    sessionHistoryRepository.clearSessions(userId);
    refreshSessions();
  }, [userId, refreshSessions]);

  return {
    sessions,
    isLoading,
    refreshSessions,
    addSession,
    removeSession,
    updateSession,
    updateSessionStatus,
    clearSessions,
  };
}
