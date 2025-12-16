export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'incident' | 'service_request' | 'change' | 'problem';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  requester: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
}

export type WorkflowConditionType = 'priority' | 'category' | 'tag' | 'status' | 'assignee';
export type WorkflowConditionOperator = 'equals' | 'contains' | 'not_equals';

export interface WorkflowCondition {
  id: string;
  type: WorkflowConditionType;
  operator: WorkflowConditionOperator;
  value: string;
}

export type WorkflowActionType =
  | 'assign'
  | 'change_status'
  | 'change_priority'
  | 'add_tag'
  | 'send_notification'
  | 'escalate';

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  value: string;
  description: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'ticket_created' | 'ticket_updated' | 'status_changed' | 'priority_changed';
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: Date;
  executionCount: number;
}

export interface WorkflowExecution {
  id: string;
  ruleId: string;
  ticketId: string;
  executedAt: Date;
  success: boolean;
  actionsExecuted: string[];
}
