import { useEffect, useState, useMemo } from 'react';
import { App as KonstaApp } from 'konsta/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useStore } from './state/store';
import Shell from './components/Layout/Shell';
import ChatView from './components/Chat/ChatView';
import AgentList from './components/Agents/AgentList';
import ExecutionView from './components/Execution/ExecutionView';
import GuideView from './components/Guide/GuideView';
import SettingsSheet from './components/Settings/SettingsSheet';
import VoiceOnlyView from './components/Voice/VoiceOnlyView';
import AuthPage from './components/Auth/AuthPage';

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
  const { activeTab, modalityMode, loadConversations } = useStore();
  const isDark = useIsDark();
  useDirection();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load conversations from DB once authenticated
  useEffect(() => {
    if (session) {
      loadConversations();
    }
  }, [session, loadConversations]);

  const isVoiceOnly = modalityMode === 'voice_only';

  if (authLoading) {
    return (
      <KonstaApp theme="ios" dark={isDark} safeAreas className={isDark ? 'dark' : ''}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-2 border-[#7c6aef] border-t-transparent rounded-full" />
        </div>
      </KonstaApp>
    );
  }

  if (!session) {
    return (
      <KonstaApp theme="ios" dark={isDark} safeAreas className={isDark ? 'dark' : ''}>
        <AuthPage />
      </KonstaApp>
    );
  }

  return (
    <KonstaApp theme="ios" dark={isDark} safeAreas className={isDark ? 'dark' : ''}>
      {isVoiceOnly ? (
        <VoiceOnlyView />
      ) : (
        <Shell>
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'agents' && <AgentList />}
          {activeTab === 'history' && <ExecutionView />}
          {activeTab === 'guide' && <GuideView />}
        </Shell>
      )}
      <SettingsSheet />
    </KonstaApp>
  );
}
