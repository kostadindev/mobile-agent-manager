import type { TaskPlan } from './tasks';
import type { ExecutionGraphState } from './graph';

export type MessageRole = 'user' | 'assistant' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  voiceTranscript?: string;
  agentId?: string;
  taskPlan?: TaskPlan;
  executionGraph?: ExecutionGraphState;
  timestamp: string;
  inputModality: 'text' | 'voice' | 'image';
}
