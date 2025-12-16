'use client';

import { useState, useEffect } from 'react';
import { Ticket, WorkflowRule, WorkflowExecution } from '@/lib/types';
import { WorkflowEngine } from '@/lib/workflowEngine';
import { storage } from '@/lib/storage';
import TicketManager from '@/components/TicketManager';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import WorkflowExecutions from '@/components/WorkflowExecutions';
import { Zap, Ticket as TicketIcon, Settings, Activity } from 'lucide-react';

type Tab = 'tickets' | 'workflows' | 'executions';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [engine] = useState(() => new WorkflowEngine());

  useEffect(() => {
    const loadedTickets = storage.getTickets();
    const loadedWorkflows = storage.getWorkflows();
    const loadedExecutions = storage.getExecutions();

    setTickets(loadedTickets);
    setWorkflows(loadedWorkflows);
    setExecutions(loadedExecutions);
    engine.setRules(loadedWorkflows);

    // Initialize with sample data if empty
    if (loadedTickets.length === 0 && loadedWorkflows.length === 0) {
      const sampleWorkflow: WorkflowRule = {
        id: 'rule_sample_1',
        name: 'Auto-assign Critical Incidents',
        description: 'Automatically assign critical incidents to senior support',
        enabled: true,
        trigger: 'ticket_created',
        conditions: [
          {
            id: 'cond_1',
            type: 'priority',
            operator: 'equals',
            value: 'critical',
          },
          {
            id: 'cond_2',
            type: 'category',
            operator: 'equals',
            value: 'incident',
          },
        ],
        actions: [
          {
            id: 'action_1',
            type: 'assign',
            value: 'Senior Support Team',
            description: 'Assign to senior support',
          },
          {
            id: 'action_2',
            type: 'add_tag',
            value: 'escalated',
            description: 'Add escalated tag',
          },
        ],
        createdAt: new Date(),
        executionCount: 0,
      };

      const sampleWorkflow2: WorkflowRule = {
        id: 'rule_sample_2',
        name: 'Change Request Notification',
        description: 'Notify change advisory board for change requests',
        enabled: true,
        trigger: 'ticket_created',
        conditions: [
          {
            id: 'cond_3',
            type: 'category',
            operator: 'equals',
            value: 'change',
          },
        ],
        actions: [
          {
            id: 'action_3',
            type: 'send_notification',
            value: 'CAB Team - New change request submitted',
            description: 'Notify CAB',
          },
          {
            id: 'action_4',
            type: 'change_status',
            value: 'in_progress',
            description: 'Set to in progress',
          },
        ],
        createdAt: new Date(),
        executionCount: 0,
      };

      const sampleWorkflows = [sampleWorkflow, sampleWorkflow2];
      setWorkflows(sampleWorkflows);
      storage.saveWorkflows(sampleWorkflows);
      engine.setRules(sampleWorkflows);
    }
  }, [engine]);

  const handleTicketsChange = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
    storage.saveTickets(updatedTickets);
  };

  const handleWorkflowsChange = (updatedWorkflows: WorkflowRule[]) => {
    setWorkflows(updatedWorkflows);
    storage.saveWorkflows(updatedWorkflows);
    engine.setRules(updatedWorkflows);
  };

  const handleTicketChange = (ticket: Ticket, trigger: 'ticket_created' | 'ticket_updated') => {
    const result = engine.processTicket(ticket, trigger);

    if (result.executions.length > 0) {
      // Update the ticket with automation results
      const updatedTickets = tickets.map((t) =>
        t.id === ticket.id ? result.ticket : t
      );

      // If it's a new ticket, add it
      if (!tickets.find((t) => t.id === ticket.id)) {
        updatedTickets.push(result.ticket);
      }

      setTickets(updatedTickets);
      storage.saveTickets(updatedTickets);

      // Update executions
      const newExecutions = [...executions, ...result.executions];
      setExecutions(newExecutions);
      storage.saveExecutions(newExecutions);

      // Update workflow execution counts
      const updatedWorkflows = workflows.map((w) => {
        const executedRule = result.executions.find((e) => e.ruleId === w.id);
        return executedRule ? { ...w, executionCount: w.executionCount + 1 } : w;
      });
      setWorkflows(updatedWorkflows);
      storage.saveWorkflows(updatedWorkflows);
    }
  };

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === 'open').length,
    activeWorkflows: workflows.filter((w) => w.enabled).length,
    totalExecutions: executions.length,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Zap className="text-blue-600" size={36} />
            ITSM Workflow Automator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automate your IT Service Management workflows with intelligent rules
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTickets}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.activeWorkflows}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">{stats.totalExecutions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Executions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'tickets'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <TicketIcon size={20} />
                Tickets
              </button>
              <button
                onClick={() => setActiveTab('workflows')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'workflows'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Settings size={20} />
                Workflows
              </button>
              <button
                onClick={() => setActiveTab('executions')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'executions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Activity size={20} />
                Executions
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'tickets' && (
              <TicketManager
                tickets={tickets}
                onSave={handleTicketsChange}
                onTicketChange={handleTicketChange}
              />
            )}
            {activeTab === 'workflows' && (
              <WorkflowBuilder workflows={workflows} onSave={handleWorkflowsChange} />
            )}
            {activeTab === 'executions' && (
              <WorkflowExecutions executions={executions} workflows={workflows} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
