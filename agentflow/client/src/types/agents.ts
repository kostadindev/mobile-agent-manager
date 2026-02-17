export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  role: string;
  goal: string;
  capabilities: string[];
  enabled: boolean;
  requiresApproval: boolean;
  color: string;
}
