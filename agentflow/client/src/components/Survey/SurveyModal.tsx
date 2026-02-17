import { useState } from 'react';
import { Sheet, Block, BlockTitle, Button } from 'konsta/react';
import { useStore } from '../../state/store';

const questions = [
  { key: 'trust', label: 'I trust the results produced by the agents.' },
  { key: 'control', label: 'I felt in control of the process.' },
  { key: 'satisfaction', label: 'I am satisfied with the overall experience.' },
  { key: 'understanding', label: 'I understood what the agents were doing.' },
];

export default function SurveyModal() {
  const { showSurvey, setShowSurvey, transparencyLevel } = useStore();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const setRating = (key: string, val: number) =>
    setRatings((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    const entry = {
      ratings,
      transparencyLevel,
      timestamp: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('agentflow_surveys') || '[]');
      existing.push(entry);
      localStorage.setItem('agentflow_surveys', JSON.stringify(existing));
    } catch { /* ignore */ }
    setRatings({});
    setShowSurvey(false);
  };

  const handleSkip = () => {
    setRatings({});
    setShowSurvey(false);
  };

  return (
    <Sheet
      opened={showSurvey}
      onBackdropClick={handleSkip}
      className="pb-safe"
    >
      <BlockTitle>Quick Feedback</BlockTitle>
      <Block>
        <p className="text-xs text-slate-400 mb-3">
          Rate each statement from 1 (strongly disagree) to 7 (strongly agree).
        </p>
        {questions.map(({ key, label }) => (
          <div key={key} className="mb-4">
            <p className="text-[13px] text-slate-200 mb-1.5">{label}</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(key, n)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    ratings[key] === n
                      ? 'bg-[#7c6aef] text-white'
                      : 'bg-white/[0.06] text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Block>
      <Block className="flex gap-2">
        <Button outline onClick={handleSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Submit
        </Button>
      </Block>
    </Sheet>
  );
}
