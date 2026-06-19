import { useState, useEffect } from 'react';

export type EvaluationResult = {
  factRecallScore: number;
  toneAccuracyScore: number;
  professionalQualityScore: number;
  overallScore: number;
};

export type HistoryEntry = {
  id: string;
  intent: string;
  businessName: string;
  tone: string;
  keyFacts: string;
  modelAEmail: string;
  modelBEmail: string;
  modelAEval: EvaluationResult;
  modelBEval: EvaluationResult;
  starred: boolean;
  timestamp: number;
};

const STORAGE_KEY = 'emailgenie_history';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveEntries = (newEntries: HistoryEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    saveEntries([newEntry, ...entries]);
    return newEntry.id;
  };

  const updateEntry = (id: string, updates: Partial<HistoryEntry>) => {
    const newEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    saveEntries(newEntries);
  };

  const clearAll = () => {
    saveEntries([]);
  };

  return {
    entries,
    addEntry,
    updateEntry,
    clearAll,
  };
}
