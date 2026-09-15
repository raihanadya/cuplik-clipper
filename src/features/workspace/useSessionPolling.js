import { useState, useEffect, useRef, useCallback } from 'react';
import { workspaceService } from './workspaceService.js';

const POLLING_INTERVAL_MS = 5000;

export function useSessionPolling(sessionId, onComplete) {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const pollStatus = useCallback(async () => {
    if (!sessionId || inFlightRef.current || isFinished) return;

    inFlightRef.current = true;
    try {
      const data = await workspaceService.getSessionStatus(sessionId);
      if (!isMountedRef.current) return;

      setStatusData(data);
      setIsLoading(false);
      setError(null);

      // Check if finished
      const isProgressComplete = data.overall_progress_percentage === 100;
      const hasFailedStage = data.stages_detail && Object.values(data.stages_detail).includes('failed');

      if (isProgressComplete || hasFailedStage) {
        setIsFinished(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (isProgressComplete && onCompleteRef.current) {
          onCompleteRef.current(data);
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err);
      setIsLoading(false);
    } finally {
      inFlightRef.current = false;
    }
  }, [sessionId, isFinished]);

  useEffect(() => {
    isMountedRef.current = true;
    setIsFinished(false);
    setIsLoading(true);
    setError(null);

    // Initial immediate poll
    pollStatus();

    // Start 5-second interval
    timerRef.current = setInterval(() => {
      pollStatus();
    }, POLLING_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionId, pollStatus]);

  return {
    statusData,
    isLoading,
    error,
    isFinished,
    refetch: pollStatus,
  };
}
