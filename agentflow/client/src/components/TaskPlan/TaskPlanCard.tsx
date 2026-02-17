import { Card, List, ListItem } from 'konsta/react';
import { BookOpen, Lightbulb, Globe, Bot, Check, Loader2, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { TaskPlan } from '../../types/tasks';
import ApprovalControls from './ApprovalControls';

const iconMap: Record<string, LucideIcon> = {
  arxiv: BookOpen, proposal: Lightbulb, wikipedia: Globe,
};
const colorMap: Record<string, string> = {
  arxiv: '#A855F7', proposal: '#F97316', wikipedia: '#06B6D4',
};

const statusLabels: Record<string, { text: string; color: string }> = {
  proposed: { text: 'Proposed', color: '#F59E0B' },
  executing: { text: 'Executing', color: '#7c6aef' },
  completed: { text: 'Completed', color: '#22C55E' },
  failed: { text: 'Failed', color: '#EF4444' },
};

export default function TaskPlanCard({ plan }: { plan: TaskPlan }) {
  const status = statusLabels[plan.status] ?? { text: plan.status, color: '#888' };

  return (
    <Card
      outline
      header={
        <div className="flex items-center justify-between">
          <span className="font-semibold">Task Plan</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: status.color, backgroundColor: `${status.color}20` }}>
            {status.text}
          </span>
        </div>
      }
      headerDivider
      footer={<ApprovalControls />}
      footerDivider={plan.status === 'proposed'}
    >
      <p className="text-sm opacity-60 mb-3">{plan.summary}</p>
      <List nested>
        {plan.steps.map((step) => {
          const Icon = iconMap[step.agentId] ?? Bot;
          const color = colorMap[step.agentId] ?? '#888';
          return (
            <ListItem
              key={step.id}
              title={step.description}
              subtitle={
                <span className="flex items-center gap-1">
                  {step.agentId}
                  {step.requiresApproval && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                </span>
              }
              media={
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              }
              after={
                step.status === 'running' ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
                step.status === 'completed' ? <Check className="w-4 h-4 text-green-500" /> :
                <div className="w-3 h-3 rounded-full border border-gray-600" />
              }
            />
          );
        })}
      </List>
    </Card>
  );
}
