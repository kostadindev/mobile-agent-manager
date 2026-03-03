import { Check, X, Loader2 } from 'lucide-react';

interface StepResultProps {
  stepId: string;
  description: string;
  status: string;
  result?: string;
}

export default function StepResult({ description, status, result }: StepResultProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
      <div className="mt-0.5">
        {status === 'completed' && (
          <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-400" />
          </div>
        )}
        {status === 'running' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
        {status === 'failed' && (
          <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
            <X className="w-3 h-3 text-red-400" />
          </div>
        )}
        {status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-700" />}
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-slate-200 leading-snug">{description}</p>
        {result && (
          <p className={`text-[11px] mt-1 leading-relaxed ${
            status === 'failed' ? 'text-red-400/80' : 'text-slate-500'
          }`}>
            {status === 'failed' ? `Error: ${result}` : result}
          </p>
        )}
      </div>
    </div>
  );
}
