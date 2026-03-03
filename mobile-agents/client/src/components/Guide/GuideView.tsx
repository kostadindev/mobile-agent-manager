import { Navbar, BlockTitle, Block, List, ListItem } from 'konsta/react';
import { MessageSquare, Sliders, Eye, Bot, GitFork, Clock } from 'lucide-react';
import { useT } from '../../i18n';

const sections = [
  { key: 'gettingStarted', Icon: MessageSquare, color: '#3B82F6' },
  { key: 'inputModes', Icon: Sliders, color: '#8B5CF6' },
  { key: 'transparencyModes', Icon: Eye, color: '#F59E0B' },
  { key: 'agents', Icon: Bot, color: '#10B981' },
  { key: 'executionGraph', Icon: GitFork, color: '#EF4444' },
  { key: 'history', Icon: Clock, color: '#06B6D4' },
] as const;

export default function GuideView() {
  const t = useT();

  return (
    <div className="h-full flex flex-col bg-surface">
      <Navbar title={t('guide.title')} subtitle={t('guide.subtitle')} />
      <div className="flex-1 overflow-y-auto">
        {sections.map(({ key, Icon, color }) => (
          <div key={key}>
            <BlockTitle>{t(`guide.${key}` as const)}</BlockTitle>
            <List strong inset outline>
              <ListItem
                title={t(`guide.${key}` as const)}
                text={t(`guide.${key}Desc` as const)}
                media={
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                }
              />
            </List>
          </div>
        ))}
        <Block className="mb-8" />
      </div>
    </div>
  );
}
