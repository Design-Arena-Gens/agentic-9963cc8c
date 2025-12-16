'use client';

import { WorkflowExecution, WorkflowRule } from '@/lib/types';
import { CheckCircle, Clock } from 'lucide-react';

interface WorkflowExecutionsProps {
  executions: WorkflowExecution[];
  workflows: WorkflowRule[];
}

export default function WorkflowExecutions({ executions, workflows }: WorkflowExecutionsProps) {
  const getWorkflowName = (ruleId: string) => {
    const workflow = workflows.find((w) => w.id === ruleId);
    return workflow?.name || 'Unknown Workflow';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Workflow Executions</h2>

      {executions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No workflow executions yet. Create some tickets and workflows to see automations in action!
        </div>
      ) : (
        <div className="space-y-3">
          {executions.slice().reverse().map((execution) => (
            <div
              key={execution.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {execution.success ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <Clock size={20} className="text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {getWorkflowName(execution.ruleId)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Ticket ID: {execution.ticketId}
                  </p>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Actions executed:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                      {execution.actionsExecuted.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {execution.executedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
