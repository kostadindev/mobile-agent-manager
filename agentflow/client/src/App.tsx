import { App as KonstaApp } from 'konsta/react';
import { useStore } from './state/store';
import Shell from './components/Layout/Shell';
import ChatView from './components/Chat/ChatView';
import AgentList from './components/Agents/AgentList';
import ExecutionView from './components/Execution/ExecutionView';

export default function App() {
  const { activeTab } = useStore();

  return (
    <KonstaApp theme="ios" dark safeAreas className="dark">
      <Shell>
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'agents' && <AgentList />}
        {activeTab === 'history' && <ExecutionView />}
      </Shell>
    </KonstaApp>
  );
}
