import { Sheet, Block, Button } from 'konsta/react';
import { useStore } from '../../state/store';

const levels = [
  { value: 'black_box' as const, label: 'Black Box', description: 'Agents execute automatically — only the final answer is shown.' },
  { value: 'plan_preview' as const, label: 'Plan Preview', description: 'See the task plan before execution, but no live graph.' },
  { value: 'full_transparency' as const, label: 'Full Transparency', description: 'See the task plan and live execution graph.' },
];

const modalities = [
  { value: 'multimodal' as const, label: 'Multimodal', description: 'Text, images, and voice input.' },
  { value: 'text_image' as const, label: 'Text + Images', description: 'Text and image input only — no voice.' },
  { value: 'voice_only' as const, label: 'Voice Only', description: 'Voice input only — no text or images.' },
];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const active = options.find((o) => o.value === value);
  return (
    <div>
      <div className="flex rounded-xl bg-white/[0.06] p-1 gap-1">
        {options.map((o) => {
          const isActive = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6aef] text-white shadow-md'
                  : 'text-white/50 active:bg-white/[0.08]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {active && (
        <p className="text-[12px] text-white/40 mt-2 px-1">{active.description}</p>
      )}
    </div>
  );
}

export default function SettingsSheet() {
  const { showSettings, setShowSettings, transparencyLevel, setTransparencyLevel, modalityMode, setModalityMode, startNewConversation } =
    useStore();

  return (
    <Sheet
      opened={showSettings}
      onBackdropClick={() => setShowSettings(false)}
      className="pb-safe"
    >
      <div className="px-4 py-4 space-y-6">
        <div>
          <p className="text-[13px] font-semibold text-white/60 uppercase tracking-wide mb-2">Transparency Mode</p>
          <SegmentedControl options={levels} value={transparencyLevel} onChange={setTransparencyLevel} />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-white/60 uppercase tracking-wide mb-2">Input Mode</p>
          <SegmentedControl options={modalities} value={modalityMode} onChange={setModalityMode} />
        </div>

        <Button
          outline
          onClick={() => {
            startNewConversation();
            setShowSettings(false);
          }}
          className="!text-red-400 !border-red-400/40"
        >
          Clear History
        </Button>
      </div>
    </Sheet>
  );
}
