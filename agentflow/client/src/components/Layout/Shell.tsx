import type { ReactNode } from 'react';
import { Tabbar, TabbarLink } from 'konsta/react';
import { MessageSquare, Bot, Clock } from 'lucide-react';
import { useStore } from '../../state/store';

const tabs = [
  { id: 'chat' as const, label: 'Chat', Icon: MessageSquare },
  { id: 'agents' as const, label: 'Agents', Icon: Bot },
  { id: 'history' as const, label: 'History', Icon: Clock },
];

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { activeTab, setActiveTab } = useStore();

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
