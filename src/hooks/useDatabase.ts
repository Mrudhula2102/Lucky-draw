import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import type { Contest, Participant, Prize } from '../services/database';

// Hook for managing contests
export function useContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getAllContests();
      setContests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const createContest = async (contestData: Omit<Contest, 'contest_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newContest = await DatabaseService.createContest(contestData);
      setContests(prev => [newContest, ...prev]);
      return newContest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contest');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  return {
    contests,
    loading,
    error,
    loadContests,
    createContest,
  };
}

// Hook for managing participants
export function useParticipants(contestId?: number) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getParticipantsByContest(id);
      setParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (participantData: Omit<Participant, 'participant_id' | 'entry_timestamp'>) => {
    try {
      setLoading(true);
      setError(null);
      const newParticipant = await DatabaseService.addParticipant(participantData);
      setParticipants(prev => [newParticipant, ...prev]);
      return newParticipant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contestId) {
      loadParticipants(contestId);
    }
  }, [contestId]);

  return {
    participants,
    loading,
    error,
    loadParticipants,
    addParticipant,
  };
}

// Hook for managing prizes
export function usePrizes(contestId?: number) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrizes = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getPrizesByContest(id);
      setPrizes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prizes');
    } finally {
      setLoading(false);
    }
  };

  const createPrize = async (prizeData: Omit<Prize, 'prize_id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newPrize = await DatabaseService.createPrize(prizeData);
      setPrizes(prev => [...prev, newPrize]);
      return newPrize;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prize');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contestId) {
      loadPrizes(contestId);
    }
  }, [contestId]);

  return {
    prizes,
    loading,
    error,
    loadPrizes,
    createPrize,
  };
}

// Hook for executing draws
export function useDraws() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRandomDraw = async (
    contestId: number,
    executedBy: number,
    numberOfWinners: number,
    prizeIds?: number[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await DatabaseService.executeRandomDraw(
        contestId,
        executedBy,
        numberOfWinners,
        prizeIds
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute draw');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    executeRandomDraw,
  };
}
