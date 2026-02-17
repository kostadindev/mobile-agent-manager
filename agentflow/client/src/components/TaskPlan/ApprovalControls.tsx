import { Button } from 'konsta/react';
import { Play, X } from 'lucide-react';
import { useStore } from '../../state/store';

export default function ApprovalControls() {
  const { currentPlan, executePlan, isExecuting } = useStore();
  if (!currentPlan || currentPlan.status !== 'proposed') return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={executePlan}
        disabled={isExecuting}
        small
        inline
      >
        <Play className="w-3.5 h-3.5 mr-1" /> Execute
      </Button>
      <Button
        onClick={() => useStore.getState().setCurrentPlan(null)}
        small
        inline
        outline
      >
        <X className="w-3.5 h-3.5 mr-1" /> Cancel
      </Button>
    </div>
  );
}
