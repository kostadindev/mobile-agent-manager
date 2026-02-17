import { useEffect, useState } from 'react';
import { Navbar, List, ListItem, Block, Toggle, Fab } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain, Plus, Trash2, type LucideIcon } from 'lucide-react';
import { useStore } from '../../state/store';
import type { Agent } from '../../types/agents';
import AgentFormSheet from './AgentFormSheet';

const DEFAULT_AGENTS: Agent[] = [
  { id: 'arxiv', name: 'ArXiv Agent', icon: 'BookOpen', description: 'Search and summarize recent arXiv papers', role: 'ArXiv Research Analyst', goal: '', capabilities: ['arxiv_search', 'arxiv_summarize'], enabled: true, requiresApproval: false, color: '#A855F7' },
  { id: 'proposal', name: 'Proposal Agent', icon: 'Lightbulb', description: 'Generate research proposals and methodology outlines', role: 'Research Proposal Strategist', goal: '', capabilities: ['generate_proposal', 'outline_methodology'], enabled: true, requiresApproval: false, color: '#F97316' },
  { id: 'wikipedia', name: 'Wikipedia Agent', icon: 'Globe', description: 'Look up and summarize Wikipedia articles', role: 'Background Research Specialist', goal: '', capabilities: ['wiki_search', 'wiki_summarize'], enabled: true, requiresApproval: false, color: '#06B6D4' },
];

const iconMap: Record<string, LucideIcon> = { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain };

export default function AgentList() {
  const { agents, setAgents, createAgent, updateAgent, deleteAgent, toggleAgent } = useStore();
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents');
        if (res.ok) { setAgents(await res.json()); return; }
      } catch { /* fallback */ }
      setAgents(DEFAULT_AGENTS);
    }
    if (agents.length === 0) fetchAgents();
  }, [agents.length, setAgents]);

  const handleSave = async (agent: Agent) => {
    if (editingAgent) {
      await updateAgent(agent);
    } else {
      await createAgent(agent);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingAgent(null);
    setShowForm(true);
  };

  return (
    <div className="h-full flex flex-col bg-ios-dark-surface relative">
      <Navbar title="Agents" subtitle="Assembled dynamically for each task" />
      <div className="flex-1 overflow-y-auto">
        {agents.length === 0 ? (
          <Block className="text-center mt-16">
            <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No agents configured</p>
            <p className="text-slate-600 text-xs mt-1">Tap + to add one</p>
          </Block>
        ) : (
          <List strong inset outline>
            {agents.map((agent) => {
              const Icon = iconMap[agent.icon] ?? Bot;
              return (
                <ListItem
                  key={agent.id}
                  title={agent.name}
                  subtitle={agent.description}
                  text={agent.requiresApproval ? 'Requires approval' : 'Auto-execute'}
                  onClick={() => handleEdit(agent)}
                  media={
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                  }
                  after={
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label={`Delete ${agent.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <Toggle
                        checked={agent.enabled}
                        onChange={() => toggleAgent(agent.id)}
                      />
                    </div>
                  }
                />
              );
            })}
          </List>
        )}
      </div>

      <Fab
        className="fixed right-4 bottom-20 z-20"
        onClick={handleCreate}
        icon={<Plus className="w-6 h-6" />}
      />

      <AgentFormSheet
        agent={editingAgent}
        opened={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </div>
  );
}
