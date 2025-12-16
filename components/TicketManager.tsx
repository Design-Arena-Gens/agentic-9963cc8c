'use client';

import { useState } from 'react';
import { Ticket, TicketPriority, TicketStatus, TicketCategory } from '@/lib/types';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TicketManagerProps {
  tickets: Ticket[];
  onSave: (tickets: Ticket[]) => void;
  onTicketChange: (ticket: Ticket, trigger: 'ticket_created' | 'ticket_updated') => void;
}

export default function TicketManager({ tickets, onSave, onTicketChange }: TicketManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  const createNewTicket = () => {
    const newTicket: Ticket = {
      id: `ticket_${Date.now()}`,
      title: '',
      description: '',
      category: 'incident',
      priority: 'medium',
      status: 'open',
      requester: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
    setEditingTicket(newTicket);
    setShowForm(true);
  };

  const editTicket = (ticket: Ticket) => {
    setEditingTicket({ ...ticket });
    setShowForm(true);
  };

  const saveTicket = () => {
    if (!editingTicket || !editingTicket.title) return;

    const existingIndex = tickets.findIndex((t) => t.id === editingTicket.id);
    let updatedTickets;
    const isNew = existingIndex < 0;

    if (isNew) {
      updatedTickets = [...tickets, editingTicket];
    } else {
      updatedTickets = [...tickets];
      updatedTickets[existingIndex] = editingTicket;
    }

    onSave(updatedTickets);
    onTicketChange(editingTicket, isNew ? 'ticket_created' : 'ticket_updated');
    setShowForm(false);
    setEditingTicket(null);
  };

  const deleteTicket = (id: string) => {
    onSave(tickets.filter((t) => t.id !== id));
  };

  const filteredTickets =
    filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} className="text-blue-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-yellow-600" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <button
          onClick={createNewTicket}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Ticket
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            {status !== 'all' && ` (${tickets.filter((t) => t.status === status).length})`}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(ticket.status)}
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {ticket.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {ticket.category}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                  {ticket.assignee && (
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Assigned: {ticket.assignee}
                    </span>
                  )}
                </div>
                {ticket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ticket.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Created: {ticket.createdAt.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editTicket(ticket)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteTicket(ticket.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold">
                {tickets.find((t) => t.id === editingTicket.id) ? 'Edit Ticket' : 'Create Ticket'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={editingTicket.title}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingTicket.description}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingTicket.category}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        category: e.target.value as TicketCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  >
                    <option value="incident">Incident</option>
                    <option value="service_request">Service Request</option>
                    <option value="change">Change</option>
                    <option value="problem">Problem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={editingTicket.priority}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        priority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        status: e.target.value as TicketStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assignee</label>
                  <input
                    type="text"
                    value={editingTicket.assignee || ''}
                    onChange={(e) =>
                      setEditingTicket({ ...editingTicket, assignee: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    placeholder="Unassigned"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingTicket.tags.join(', ')}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  placeholder="urgent, network, hardware"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTicket(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTicket}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
