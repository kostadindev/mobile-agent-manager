import { useEffect } from 'react';
import { Navbar, List, ListItem, Block } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, type LucideIcon } from 'lucide-react';
import { useStore } from '../../state/store';
import type { Agent } from '../../types/agents';

const DEFAULT_AGENTS: Agent[] = [
  { id: 'arxiv', name: 'ArXiv Agent', icon: 'BookOpen', description: 'Search and summarize recent arXiv papers', role: 'ArXiv Research Analyst', goal: '', capabilities: ['arxiv_search', 'arxiv_summarize'], enabled: true, requiresApproval: false, color: '#A855F7' },
  { id: 'proposal', name: 'Proposal Agent', icon: 'Lightbulb', description: 'Generate research proposals and methodology outlines', role: 'Research Proposal Strategist', goal: '', capabilities: ['generate_proposal', 'outline_methodology'], enabled: true, requiresApproval: false, color: '#F97316' },
  { id: 'wikipedia', name: 'Wikipedia Agent', icon: 'Globe', description: 'Look up and summarize Wikipedia articles', role: 'Background Research Specialist', goal: '', capabilities: ['wiki_search', 'wiki_summarize'], enabled: true, requiresApproval: false, color: '#06B6D4' },
];

const iconMap: Record<string, LucideIcon> = { BookOpen, Lightbulb, Globe, Bot };

export default function AgentList() {
  const { agents, setAgents } = useStore();

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

  return (
    <div className="h-full flex flex-col bg-ios-dark-surface">
      <Navbar title="Agents" subtitle="Assembled dynamically for each task" />
      <div className="flex-1 overflow-y-auto">
        <List strong inset outline>
          {agents.map((agent) => {
            const Icon = iconMap[agent.icon] ?? Bot;
            return (
              <ListItem
                key={agent.id}
                title={agent.name}
                subtitle={agent.description}
                text={agent.requiresApproval ? 'Requires approval' : 'Auto-execute'}
                media={
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${agent.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                }
                after={
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: agent.enabled ? '#22C55E' : '#555' }}
                  />
                }
              />
            );
          })}
        </List>
      </div>
    </div>
  );
}
