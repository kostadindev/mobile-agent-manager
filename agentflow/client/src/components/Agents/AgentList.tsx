import { useEffect, useState } from 'react';
import { Navbar, List, ListItem, Block, Toggle, BlockTitle } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain, type LucideIcon } from 'lucide-react';
import { useStore } from '../../state/store';
import type { Agent } from '../../types/agents';
import AgentDetailSheet from './AgentDetailSheet';

const DEFAULT_AGENTS: Agent[] = [
  { id: 'orchestrator', name: 'Orchestrator', icon: 'Brain', description: 'Plans and coordinates all agent tasks', role: 'Task Orchestrator', goal: 'Analyze user requests and create structured execution plans', backstory: '', capabilities: ['planning', 'delegation', 'synthesis'], enabled: true, requiresApproval: false, color: '#7c6aef', isOrchestrator: true, constitution: '' },
  { id: 'arxiv', name: 'ArXiv Agent', icon: 'BookOpen', description: 'Search and summarize recent arXiv papers', role: 'ArXiv Research Analyst', goal: 'Search and summarize recent academic papers from arXiv', backstory: '', capabilities: ['arxiv_search', 'arxiv_summarize'], enabled: true, requiresApproval: false, color: '#A855F7' },
  { id: 'proposal', name: 'Proposal Agent', icon: 'Lightbulb', description: 'Generate research proposals and methodology outlines', role: 'Research Proposal Strategist', goal: 'Generate structured research proposals and methodology outlines', backstory: '', capabilities: ['generate_proposal', 'outline_methodology'], enabled: true, requiresApproval: false, color: '#F97316' },
  { id: 'wikipedia', name: 'Wikipedia Agent', icon: 'Globe', description: 'Look up and summarize Wikipedia articles', role: 'Background Research Specialist', goal: 'Look up and summarize background information from Wikipedia', backstory: '', capabilities: ['wiki_search', 'wiki_summarize'], enabled: true, requiresApproval: false, color: '#06B6D4' },
];

const iconMap: Record<string, LucideIcon> = { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain };

export default function AgentList() {
  const { agents, setAgents, toggleAgent } = useStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

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

  const orchestrator = agents.find((a) => a.isOrchestrator);
  const workerAgents = agents.filter((a) => !a.isOrchestrator);

  return (
    <div className="h-full flex flex-col bg-ios-dark-surface">
      <Navbar title="Agents" subtitle="Assembled dynamically for each task" />
      <div className="flex-1 overflow-y-auto">
        {agents.length === 0 ? (
          <Block className="text-center mt-16">
            <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No agents configured</p>
          </Block>
        ) : (
          <>
            {/* Orchestrator */}
            {orchestrator && (() => {
              const Icon = iconMap[orchestrator.icon] ?? Brain;
              return (
                <>
                  <BlockTitle>Orchestrator</BlockTitle>
                  <List strong inset outline>
                    <ListItem
                      title={orchestrator.name}
                      subtitle={orchestrator.description}
                      text="Always active"
                      link
                      onClick={() => setSelectedAgent(orchestrator)}
                      media={
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${orchestrator.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: orchestrator.color }} />
                        </div>
                      }
                    />
                  </List>
                </>
              );
            })()}

            {/* Worker agents */}
            <BlockTitle>Agents</BlockTitle>
            <List strong inset outline>
              {workerAgents.map((agent) => {
                const Icon = iconMap[agent.icon] ?? Bot;
                return (
                  <ListItem
                    key={agent.id}
                    title={agent.name}
                    subtitle={agent.description}
                    text={`${agent.capabilities.length} tool${agent.capabilities.length !== 1 ? 's' : ''}`}
                    link
                    onClick={() => setSelectedAgent(agent)}
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
          </>
        )}
      </div>

      <AgentDetailSheet
        agent={selectedAgent}
        opened={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}
