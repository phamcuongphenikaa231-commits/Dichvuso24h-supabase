'use client';

import { ActivityLog, LogAction } from '@/types/admin';
import { adminLogStore, ACTION_LABELS as MOCK_ACTION_LABELS } from '@/data/mockAdminLogs';

const STORAGE_KEY = 'dv24h_activity_logs';

export const ACTION_LABELS: Record<LogAction, string> = MOCK_ACTION_LABELS;

let logs: ActivityLog[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function seed(): ActivityLog[] {
  return adminLogStore.getLogs().map((log) => ({ ...log }));
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    logs = raw ? (JSON.parse(raw) as ActivityLog[]) : seed();
    if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    logs = seed();
  }
  initialized = true;
}

function persist() {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  listeners.forEach((listener) => listener());
}

export const activityLogService = {
  getLogs(): ActivityLog[] {
    ensureInitialized();
    return [...logs];
  },

  addLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog {
    ensureInitialized();
    const entry: ActivityLog = {
      ...log,
      id: `LOG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    logs = [entry, ...logs];
    persist();
    return entry;
  },

  reset() {
    logs = seed();
    initialized = true;
    persist();
  },

  subscribe(listener: () => void): () => void {
    ensureInitialized();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
