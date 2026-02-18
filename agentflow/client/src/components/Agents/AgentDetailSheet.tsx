import { useState, useEffect } from 'react';
import { Sheet, Block, BlockTitle, Button } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain, Wrench, type LucideIcon } from 'lucide-react';
import { useStore } from '../../state/store';
import type { Agent } from '../../types/agents';

const iconMap: Record<string, LucideIcon> = { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain };

interface AgentDetailSheetProps {
  agent: Agent | null;
  opened: boolean;
  onClose: () => void;
}

export default function AgentDetailSheet({ agent, opened, onClose }: AgentDetailSheetProps) {
  const { updateConstitution } = useStore();
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (agent) {
      setDraft(agent.constitution ?? '');
      setDirty(false);
    }
  }, [agent, opened]);

  if (!agent) return null;
  const Icon = iconMap[agent.icon] ?? Bot;

  const handleSave = async () => {
    await updateConstitution(agent.id, draft);
    setDirty(false);
  };

  return (
    <Sheet
      opened={opened}
      onBackdropClick={onClose}
      className="pb-safe !max-h-[85vh]"
    >
      <div className="overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <Block className="flex items-center gap-3 !mb-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${agent.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: agent.color }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-on-surface">{agent.name}</h2>
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
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-control-bg text-slate-300"
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

        {/* Constitution (orchestrator only) */}
        {agent.isOrchestrator && (
          <>
            <BlockTitle>Constitution</BlockTitle>
            <Block>
              <p className="text-[11px] text-slate-500 mb-2">
                Custom guidelines appended to the orchestrator's system prompt.
              </p>
              <textarea
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setDirty(true); }}
                placeholder="e.g. Always prefer arXiv over Wikipedia. Keep plans under 3 steps..."
                rows={4}
                className="w-full bg-hover border border-border rounded-xl px-3 py-2 text-[13px] text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed"
              />
              {dirty && (
                <Button onClick={handleSave} small inline className="mt-2">
                  Save
                </Button>
              )}
            </Block>
          </>
        )}
      </div>
    </Sheet>
  );
}
