export interface TaskStep {
  id: string;
  agentId: string;
  action: string;
  description: string;
  params: Record<string, unknown>;
  status: 'pending' | 'running' | 'awaiting_approval' | 'completed' | 'failed';
  result?: string;
  requiresApproval: boolean;
  dependsOn?: string[];
}

export interface TaskPlan {
  id: string;
  summary: string;
  steps: TaskStep[];
  status: 'proposed' | 'approved' | 'executing' | 'completed' | 'failed';
  createdAt: string;
}
