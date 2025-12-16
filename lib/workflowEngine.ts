import { Ticket, WorkflowRule, WorkflowCondition, WorkflowAction, WorkflowExecution } from './types';

export class WorkflowEngine {
  private rules: WorkflowRule[] = [];
  private executions: WorkflowExecution[] = [];

  constructor(rules: WorkflowRule[] = []) {
    this.rules = rules;
  }

  setRules(rules: WorkflowRule[]) {
    this.rules = rules;
  }

  evaluateCondition(ticket: Ticket, condition: WorkflowCondition): boolean {
    const { type, operator, value } = condition;

    let fieldValue: string = '';

    switch (type) {
      case 'priority':
        fieldValue = ticket.priority;
        break;
      case 'category':
        fieldValue = ticket.category;
        break;
      case 'status':
        fieldValue = ticket.status;
        break;
      case 'assignee':
        fieldValue = ticket.assignee || '';
        break;
      case 'tag':
        return operator === 'equals'
          ? ticket.tags.includes(value)
          : !ticket.tags.includes(value);
      default:
        return false;
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return fieldValue.includes(value);
      default:
        return false;
    }
  }

  evaluateRule(ticket: Ticket, rule: WorkflowRule): boolean {
    if (!rule.enabled) return false;
    if (rule.conditions.length === 0) return true;

    return rule.conditions.every((condition) =>
      this.evaluateCondition(ticket, condition)
    );
  }

  executeAction(ticket: Ticket, action: WorkflowAction): Ticket {
    const updatedTicket = { ...ticket };

    switch (action.type) {
      case 'assign':
        updatedTicket.assignee = action.value;
        break;
      case 'change_status':
        updatedTicket.status = action.value as any;
        break;
      case 'change_priority':
        updatedTicket.priority = action.value as any;
        break;
      case 'add_tag':
        if (!updatedTicket.tags.includes(action.value)) {
          updatedTicket.tags = [...updatedTicket.tags, action.value];
        }
        break;
      case 'escalate':
        if (updatedTicket.priority === 'low') updatedTicket.priority = 'medium';
        else if (updatedTicket.priority === 'medium') updatedTicket.priority = 'high';
        else if (updatedTicket.priority === 'high') updatedTicket.priority = 'critical';
        break;
      case 'send_notification':
        // In a real system, this would send an actual notification
        console.log(`Notification sent: ${action.value}`);
        break;
    }

    updatedTicket.updatedAt = new Date();
    return updatedTicket;
  }

  processTicket(ticket: Ticket, trigger: WorkflowRule['trigger']): {
    ticket: Ticket;
    executions: WorkflowExecution[];
  } {
    let updatedTicket = { ...ticket };
    const newExecutions: WorkflowExecution[] = [];

    const applicableRules = this.rules.filter(
      (rule) => rule.trigger === trigger && this.evaluateRule(updatedTicket, rule)
    );

    for (const rule of applicableRules) {
      const actionsExecuted: string[] = [];

      for (const action of rule.actions) {
        updatedTicket = this.executeAction(updatedTicket, action);
        actionsExecuted.push(`${action.type}: ${action.value}`);
      }

      const execution: WorkflowExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ticketId: ticket.id,
        executedAt: new Date(),
        success: true,
        actionsExecuted,
      };

      newExecutions.push(execution);
      rule.executionCount++;
    }

    this.executions.push(...newExecutions);

    return {
      ticket: updatedTicket,
      executions: newExecutions,
    };
  }

  getExecutions(): WorkflowExecution[] {
    return this.executions;
  }

  getExecutionsForTicket(ticketId: string): WorkflowExecution[] {
    return this.executions.filter((exec) => exec.ticketId === ticketId);
  }
}
