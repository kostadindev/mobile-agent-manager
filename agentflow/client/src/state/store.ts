import { create } from 'zustand';
import type { ChatMessage } from '../types/messages';
import type { TaskPlan, TaskStep } from '../types/tasks';
import type { Agent } from '../types/agents';
import type { ExecutionGraphState, NodeStatus, EdgeStatus, ExecutionSSEEvent } from '../types/graph';

type Tab = 'chat' | 'agents' | 'history';

interface AppState {
  // Navigation
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Task plan
  currentPlan: TaskPlan | null;
  setCurrentPlan: (plan: TaskPlan | null) => void;
  updateStepStatus: (stepId: string, status: TaskStep['status'], result?: string) => void;

  // Execution graph
  graphState: ExecutionGraphState | null;
  setGraphState: (graph: ExecutionGraphState | null) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus, result?: string, duration?: number) => void;
  updateEdgeStatus: (edgeId: string, status: EdgeStatus) => void;
  processSSEEvent: (event: ExecutionSSEEvent) => void;

  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  // Execution
  isExecuting: boolean;
  setExecuting: (executing: boolean) => void;

  // Graph expansion
  expandedGraph: boolean;
  setExpandedGraph: (expanded: boolean) => void;

  // Input
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;

  // Send chat
  sendChat: (message: string, imageBase64?: string, modality?: string, audioBase64?: string) => Promise<void>;
  executePlan: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Chat
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Task plan
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  updateStepStatus: (stepId, status, result) =>
    set((s) => {
      if (!s.currentPlan) return {};
      return {
        currentPlan: {
          ...s.currentPlan,
          steps: s.currentPlan.steps.map((step) =>
            step.id === stepId ? { ...step, status, result: result ?? step.result } : step
          ),
        },
      };
    }),

  // Execution graph
  graphState: null,
  setGraphState: (graph) => set({ graphState: graph }),
  updateNodeStatus: (nodeId, status, result, duration) =>
    set((s) => {
      if (!s.graphState) return {};
      return {
        graphState: {
          ...s.graphState,
          currentNodeId: status === 'running' ? nodeId : s.graphState.currentNodeId,
          nodes: s.graphState.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status, result: result ?? n.data.result, duration: duration ?? n.data.duration } }
              : n
          ),
        },
      };
    }),
  updateEdgeStatus: (edgeId, status) =>
    set((s) => {
      if (!s.graphState) return {};
      return {
        graphState: {
          ...s.graphState,
          edges: s.graphState.edges.map((e) =>
            e.id === edgeId ? { ...e, data: { ...e.data, status } } : e
          ),
        },
      };
    }),
  processSSEEvent: (event) => {
    const state = get();
    switch (event.type) {
      case 'graph_init':
        set({ graphState: event.graph });
        break;
      case 'node_status':
        state.updateNodeStatus(event.nodeId, event.status, event.result, event.duration);
        state.updateStepStatus(event.nodeId, event.status as TaskStep['status'], event.result);
        break;
      case 'edge_status':
        state.updateEdgeStatus(event.edgeId, event.status);
        break;
      case 'execution_complete':
        set((s) => ({
          isExecuting: false,
          graphState: s.graphState ? { ...s.graphState, status: 'completed' } : null,
          currentPlan: s.currentPlan ? { ...s.currentPlan, status: 'completed' } : null,
        }));
        state.addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: event.summary || 'All tasks completed successfully!',
          timestamp: new Date().toISOString(),
          inputModality: 'text',
        });
        break;
      case 'execution_failed':
        set((s) => ({
          isExecuting: false,
          graphState: s.graphState ? { ...s.graphState, status: 'failed' } : null,
        }));
        break;
    }
  },

  // Agents
  agents: [],
  setAgents: (agents) => set({ agents }),

  // Execution
  isExecuting: false,
  setExecuting: (executing) => set({ isExecuting: executing }),

  // Graph expansion
  expandedGraph: false,
  setExpandedGraph: (expanded) => set({ expandedGraph: expanded }),

  // Input
  imagePreview: null,
  setImagePreview: (url) => set({ imagePreview: url }),

  // API calls
  sendChat: async (message, imageBase64, modality = 'text', audioBase64) => {
    const state = get();
    state.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: message || (modality === 'voice' ? 'Voice message' : modality === 'image' ? 'Image sent' : ''),
      imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      timestamp: new Date().toISOString(),
      inputModality: modality as 'text' | 'voice' | 'image',
    });
    set({ isLoading: true, imagePreview: null });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          image_base64: imageBase64 ?? null,
          audio_base64: audioBase64 ?? null,
          input_modality: modality,
        }),
      });
      const data = await res.json();

      // Convert backend plan format to frontend format
      let taskPlan: TaskPlan | undefined;
      if (data.plan) {
        taskPlan = {
          id: data.plan.id || crypto.randomUUID(),
          summary: data.plan.summary,
          userMessage: data.plan.user_message,
          steps: data.plan.steps.map((s: Record<string, unknown>) => ({
            id: s.id,
            agentId: s.agent_id,
            action: s.action,
            description: s.description,
            params: s.params || {},
            status: 'pending',
            requiresApproval: s.requires_approval ?? false,
            dependsOn: s.depends_on || [],
          })),
          status: 'proposed',
          createdAt: new Date().toISOString(),
        };
        set({ currentPlan: taskPlan });
      }

      if (data.graph) {
        set({ graphState: data.graph });
      }

      state.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        taskPlan,
        executionGraph: data.graph ?? undefined,
        timestamp: new Date().toISOString(),
        inputModality: 'text',
      });
    } catch (err) {
      state.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check that the server is running.',
        timestamp: new Date().toISOString(),
        inputModality: 'text',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  executePlan: async () => {
    const state = get();
    if (!state.currentPlan || !state.graphState) return;

    set({ isExecuting: true });
    if (state.currentPlan) {
      set({ currentPlan: { ...state.currentPlan, status: 'executing' } });
    }
    if (state.graphState) {
      set({ graphState: { ...state.graphState, status: 'executing' } });
    }

    try {
      const backendPlan = {
        ...state.currentPlan,
        user_message: state.currentPlan.userMessage,
        steps: state.currentPlan.steps.map((s) => ({
          id: s.id,
          agent_id: s.agentId,
          action: s.action,
          description: s.description,
          params: s.params,
          requires_approval: s.requiresApproval,
          depends_on: s.dependsOn || [],
        })),
      };

      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: backendPlan, graph: state.graphState }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as ExecutionSSEEvent;
              get().processSSEEvent(event);
            } catch {
              // skip malformed events
            }
          }
        }
      }
    } catch (err) {
      set({ isExecuting: false });
      state.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Execution failed. Please check the server connection.',
        timestamp: new Date().toISOString(),
        inputModality: 'text',
      });
    }
  },
}));
