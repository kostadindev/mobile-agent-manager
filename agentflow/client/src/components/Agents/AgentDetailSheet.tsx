import { Sheet, Block, BlockTitle } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain, Wrench, type LucideIcon } from 'lucide-react';
import type { Agent } from '../../types/agents';

const iconMap: Record<string, LucideIcon> = { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain };

interface AgentDetailSheetProps {
  agent: Agent | null;
  opened: boolean;
  onClose: () => void;
}

export default function AgentDetailSheet({ agent, opened, onClose }: AgentDetailSheetProps) {
  if (!agent) return null;
  const Icon = iconMap[agent.icon] ?? Bot;

  return (
    <Sheet opened={opened} onBackdropClick={onClose} className="pb-safe">
      {/* Header */}
      <Block className="flex items-center gap-3 !mb-0">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: agent.color }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{agent.name}</h2>
          <p className="text-xs text-slate-400">{agent.role}</p>
        </div>
      </Block>

      {/* Goal */}
      <BlockTitle>Goal</BlockTitle>
      <Block>
        <p className="text-sm text-slate-300">{agent.goal || agent.description}</p>
      </Block>

      {/* Tools */}
      <BlockTitle>Tools</BlockTitle>
      <Block>
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((cap) => (
            <span
              key={cap}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-300"
            >
              <Wrench className="w-3 h-3 text-slate-500" />
              {cap}
            </span>
          ))}
        </div>
      </Block>

      {/* System Prompt / Backstory */}
      <BlockTitle>System Prompt</BlockTitle>
      <Block>
        <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">
          {agent.backstory || 'No system prompt configured.'}
        </p>
      </Block>
    </Sheet>
  );
}
