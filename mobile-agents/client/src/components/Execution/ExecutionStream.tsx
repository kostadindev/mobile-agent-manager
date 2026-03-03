import { useStore } from '../../state/store';
import StepResult from './StepResult';

export default function ExecutionStream() {
  const { currentPlan } = useStore();

  if (!currentPlan) return null;

  return (
    <div className="space-y-1">
      {currentPlan.steps.map((step) => (
        <StepResult
          key={step.id}
          stepId={step.id}
          description={step.description}
          status={step.status}
          result={step.result}
        />
      ))}
    </div>
  );
}
