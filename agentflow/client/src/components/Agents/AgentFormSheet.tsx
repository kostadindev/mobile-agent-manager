import { useState, useEffect } from 'react';
import { Sheet, Block, BlockTitle, Button, List, ListInput } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Search, FileText, Code, Database, Zap, Brain, type LucideIcon } from 'lucide-react';
import type { Agent } from '../../types/agents';

const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'Lightbulb', Icon: Lightbulb },
  { name: 'Globe', Icon: Globe },
  { name: 'Bot', Icon: Bot },
  { name: 'Search', Icon: Search },
  { name: 'FileText', Icon: FileText },
  { name: 'Code', Icon: Code },
  { name: 'Database', Icon: Database },
  { name: 'Zap', Icon: Zap },
  { name: 'Brain', Icon: Brain },
];

const COLOR_OPTIONS = [
  '#A855F7', '#F97316', '#06B6D4', '#3B82F6',
  '#22C55E', '#EF4444', '#F59E0B', '#EC4899',
];

interface AgentFormSheetProps {
  agent: Agent | null;
  opened: boolean;
  onClose: () => void;
  onSave: (agent: Agent) => void;
}

export default function AgentFormSheet({ agent, opened, onClose, onSave }: AgentFormSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [goal, setGoal] = useState('');
  const [icon, setIcon] = useState('Bot');
  const [color, setColor] = useState('#A855F7');

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description);
      setRole(agent.role);
      setGoal(agent.goal);
      setIcon(agent.icon);
      setColor(agent.color);
    } else {
      setName('');
      setDescription('');
      setRole('');
      setGoal('');
      setIcon('Bot');
      setColor('#A855F7');
    }
  }, [agent, opened]);

  const handleSave = () => {
    const id = agent?.id ?? name.toLowerCase().replace(/\s+/g, '-');
    onSave({
      id,
      name,
      description,
      role,
      goal,
      icon,
      color,
      capabilities: agent?.capabilities ?? [],
      enabled: agent?.enabled ?? true,
      requiresApproval: agent?.requiresApproval ?? false,
    });
    onClose();
  };

  return (
    <Sheet opened={opened} onBackdropClick={onClose} className="pb-safe">
      <BlockTitle>{agent ? 'Edit Agent' : 'New Agent'}</BlockTitle>
      <List strongIos insetIos>
        <ListInput label="Name" type="text" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Agent name" />
        <ListInput label="Description" type="text" value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder="What does this agent do?" />
        <ListInput label="Role" type="text" value={role} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)} placeholder="e.g. Research Analyst" />
        <ListInput label="Goal" type="text" value={goal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoal(e.target.value)} placeholder="Agent's goal" />
      </List>

      <BlockTitle>Icon</BlockTitle>
      <Block>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(({ name: n, Icon }) => (
            <button
              key={n}
              onClick={() => setIcon(n)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                icon === n ? 'bg-[#7c6aef] text-white' : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </Block>

      <BlockTitle>Color</BlockTitle>
      <Block>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Block>

      <Block>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {agent ? 'Update' : 'Create'}
        </Button>
      </Block>
    </Sheet>
  );
}
