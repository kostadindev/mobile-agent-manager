import { Button } from 'konsta/react';
import { Play, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';

export default function ApprovalControls() {
  const { currentPlan, executePlan, isExecuting, transparencyLevel } = useStore();
  const t = useT();
  if (!currentPlan || currentPlan.status !== 'proposed') return null;
  if (transparencyLevel === 'black_box') return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={executePlan}
        disabled={isExecuting}
        small
        inline
      >
        <Play className="w-3.5 h-3.5 me-1" /> {t('approval.execute')}
      </Button>
      <Button
        onClick={() => useStore.getState().setCurrentPlan(null)}
        small
        inline
        outline
      >
        <X className="w-3.5 h-3.5 me-1" /> {t('approval.cancel')}
      </Button>
    </div>
  );
}
