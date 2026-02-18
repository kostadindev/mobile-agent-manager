import { useEffect, useState, useMemo } from 'react';
import { App as KonstaApp } from 'konsta/react';
import { useStore } from './state/store';
import Shell from './components/Layout/Shell';
import ChatView from './components/Chat/ChatView';
import AgentList from './components/Agents/AgentList';
import ExecutionView from './components/Execution/ExecutionView';
import SettingsSheet from './components/Settings/SettingsSheet';

function useIsDark() {
  const themeMode = useStore((s) => s.themeMode);
  const mql = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);
  const [systemDark, setSystemDark] = useState(mql.matches);

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mql]);

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return isDark;
}

function useDirection() {
  const language = useStore((s) => s.language);
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);
}

export default function App() {
  const { activeTab } = useStore();
  const isDark = useIsDark();
  useDirection();

  return (
    <KonstaApp theme="ios" dark={isDark} safeAreas className={isDark ? 'dark' : ''}>
      <Shell>
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'agents' && <AgentList />}
        {activeTab === 'history' && <ExecutionView />}
      </Shell>
      <SettingsSheet />
    </KonstaApp>
  );
}
