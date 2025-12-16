import { Ticket, WorkflowRule, WorkflowExecution } from './types';

const STORAGE_KEYS = {
  TICKETS: 'itsm_tickets',
  WORKFLOWS: 'itsm_workflows',
  EXECUTIONS: 'itsm_executions',
};

export const storage = {
  getTickets: (): Ticket[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!data) return [];
    return JSON.parse(data).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      resolvedAt: t.resolvedAt ? new Date(t.resolvedAt) : undefined,
    }));
  },

  saveTickets: (tickets: Ticket[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },

  getWorkflows: (): WorkflowRule[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (!data) return [];
    return JSON.parse(data).map((w: any) => ({
      ...w,
      createdAt: new Date(w.createdAt),
    }));
  },

  saveWorkflows: (workflows: WorkflowRule[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  },

  getExecutions: (): WorkflowExecution[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);
    if (!data) return [];
    return JSON.parse(data).map((e: any) => ({
      ...e,
      executedAt: new Date(e.executedAt),
    }));
  },

  saveExecutions: (executions: WorkflowExecution[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));
  },
};
