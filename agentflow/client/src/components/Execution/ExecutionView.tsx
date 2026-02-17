import { Navbar, Block } from 'konsta/react';
import { useStore } from '../../state/store';
import ExecutionGraph from '../Graph/ExecutionGraph';
import ExecutionStream from './ExecutionStream';
import { Clock } from 'lucide-react';

export default function ExecutionView() {
  const { graphState } = useStore();

  return (
    <div className="h-full flex flex-col bg-ios-dark-surface">
      <Navbar title="History" subtitle="Task execution graphs and results" />
      <div className="flex-1 overflow-y-auto">
        {graphState ? (
          <Block className="space-y-3">
            <ExecutionGraph />
            <ExecutionStream />
          </Block>
        ) : (
          <Block className="text-center mt-24">
            <div className="w-14 h-14 rounded-2xl bg-ios-dark-surface-1 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-base opacity-50">No history yet</p>
            <p className="text-sm opacity-30 mt-1">Run a task to see executions here</p>
          </Block>
        )}
      </div>
    </div>
  );
}
