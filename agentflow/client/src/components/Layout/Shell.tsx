import type { ReactNode } from 'react';
import { Tabbar, TabbarLink } from 'konsta/react';
import { MessageSquare, Bot, Clock, BookOpen } from 'lucide-react';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { activeTab, setActiveTab } = useStore();
  const t = useT();

  const tabs = [
    { id: 'chat' as const, label: t('tab.chat'), Icon: MessageSquare },
    { id: 'agents' as const, label: t('tab.agents'), Icon: Bot },
    { id: 'history' as const, label: t('tab.history'), Icon: Clock },
    { id: 'guide' as const, label: t('tab.guide'), Icon: BookOpen },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        {children}
      </div>
      <Tabbar icons labels className="flex-shrink-0">
        {tabs.map(({ id, label, Icon }) => (
          <TabbarLink
            key={id}
            active={activeTab === id}
            onClick={() => setActiveTab(id)}
            icon={<Icon className="w-6 h-6" />}
            label={label}
          />
        ))}
      </Tabbar>
    </div>
  );
}
