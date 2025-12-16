'use client';

import { useState } from 'react';
import { WorkflowRule, WorkflowCondition, WorkflowAction } from '@/lib/types';
import { Plus, Trash2, Play, Pause } from 'lucide-react';

interface WorkflowBuilderProps {
  workflows: WorkflowRule[];
  onSave: (workflows: WorkflowRule[]) => void;
}

export default function WorkflowBuilder({ workflows, onSave }: WorkflowBuilderProps) {
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  const createNewRule = () => {
    const newRule: WorkflowRule = {
      id: `rule_${Date.now()}`,
      name: 'New Workflow Rule',
      description: '',
      enabled: true,
      trigger: 'ticket_created',
      conditions: [],
      actions: [],
      createdAt: new Date(),
      executionCount: 0,
    };
    setEditingRule(newRule);
    setShowForm(true);
  };

  const editRule = (rule: WorkflowRule) => {
    setEditingRule({ ...rule });
    setShowForm(true);
  };

  const saveRule = () => {
    if (!editingRule) return;

    const existingIndex = workflows.findIndex((w) => w.id === editingRule.id);
    let updatedWorkflows;

    if (existingIndex >= 0) {
      updatedWorkflows = [...workflows];
      updatedWorkflows[existingIndex] = editingRule;
    } else {
      updatedWorkflows = [...workflows, editingRule];
    }

    onSave(updatedWorkflows);
    setShowForm(false);
    setEditingRule(null);
  };

  const deleteRule = (id: string) => {
    onSave(workflows.filter((w) => w.id !== id));
  };

  const toggleRule = (id: string) => {
    const updatedWorkflows = workflows.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    onSave(updatedWorkflows);
  };

  const addCondition = () => {
    if (!editingRule) return;
    const newCondition: WorkflowCondition = {
      id: `cond_${Date.now()}`,
      type: 'priority',
      operator: 'equals',
      value: 'high',
    };
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, newCondition],
    });
  };

  const removeCondition = (id: string) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((c) => c.id !== id),
    });
  };

  const updateCondition = (id: string, updates: Partial<WorkflowCondition>) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const addAction = () => {
    if (!editingRule) return;
    const newAction: WorkflowAction = {
      id: `action_${Date.now()}`,
      type: 'assign',
      value: '',
      description: '',
    };
    setEditingRule({
      ...editingRule,
      actions: [...editingRule.actions, newAction],
    });
  };

  const removeAction = (id: string) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.filter((a) => a.id !== id),
    });
  };

  const updateAction = (id: string, updates: Partial<WorkflowAction>) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Rules</h2>
        <button
          onClick={createNewRule}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Rule
        </button>
      </div>

      <div className="grid gap-4">
        {workflows.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{rule.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      rule.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {rule.description || 'No description'}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Trigger: {rule.trigger.replace(/_/g, ' ')}</div>
                  <div>Conditions: {rule.conditions.length}</div>
                  <div>Actions: {rule.actions.length}</div>
                  <div>Executions: {rule.executionCount}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title={rule.enabled ? 'Disable' : 'Enable'}
                >
                  {rule.enabled ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={() => editRule(rule)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-bold">Edit Workflow Rule</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingRule.description}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trigger</label>
                <select
                  value={editingRule.trigger}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      trigger: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                >
                  <option value="ticket_created">Ticket Created</option>
                  <option value="ticket_updated">Ticket Updated</option>
                  <option value="status_changed">Status Changed</option>
                  <option value="priority_changed">Priority Changed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Conditions</label>
                  <button
                    onClick={addCondition}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Condition
                  </button>
                </div>
                <div className="space-y-2">
                  {editingRule.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <select
                        value={condition.type}
                        onChange={(e) =>
                          updateCondition(condition.id, { type: e.target.value as any })
                        }
                        className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                      >
                        <option value="priority">Priority</option>
                        <option value="category">Category</option>
                        <option value="status">Status</option>
                        <option value="tag">Tag</option>
                        <option value="assignee">Assignee</option>
                      </select>
                      <select
                        value={condition.operator}
                        onChange={(e) =>
                          updateCondition(condition.id, { operator: e.target.value as any })
                        }
                        className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                      </select>
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(condition.id, { value: e.target.value })
                        }
                        className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Actions</label>
                  <button
                    onClick={addAction}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Action
                  </button>
                </div>
                <div className="space-y-2">
                  {editingRule.actions.map((action) => (
                    <div
                      key={action.id}
                      className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <select
                        value={action.type}
                        onChange={(e) =>
                          updateAction(action.id, { type: e.target.value as any })
                        }
                        className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                      >
                        <option value="assign">Assign To</option>
                        <option value="change_status">Change Status</option>
                        <option value="change_priority">Change Priority</option>
                        <option value="add_tag">Add Tag</option>
                        <option value="send_notification">Send Notification</option>
                        <option value="escalate">Escalate Priority</option>
                      </select>
                      <input
                        type="text"
                        value={action.value}
                        onChange={(e) =>
                          updateAction(action.id, { value: e.target.value })
                        }
                        className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removeAction(action.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRule}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
