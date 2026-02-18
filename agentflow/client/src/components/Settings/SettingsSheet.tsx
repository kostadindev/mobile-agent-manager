import { Sheet, Block, BlockTitle, List, ListItem, Button } from 'konsta/react';
import { useStore } from '../../state/store';

const levels = [
  {
    value: 'black_box' as const,
    label: 'Black Box',
    description: 'Agents execute automatically — only the final answer is shown.',
  },
  {
    value: 'plan_preview' as const,
    label: 'Plan Preview',
    description: 'See the task plan before execution, but no live graph.',
  },
  {
    value: 'full_transparency' as const,
    label: 'Full Transparency',
    description: 'See the task plan and live execution graph.',
  },
];

const modalities = [
  {
    value: 'multimodal' as const,
    label: 'Multimodal',
    description: 'Text, images, and voice input.',
  },
  {
    value: 'text_image' as const,
    label: 'Text + Images',
    description: 'Text and image input only — no voice.',
  },
  {
    value: 'voice_only' as const,
    label: 'Voice Only',
    description: 'Voice input only — no text or images.',
  },
];

export default function SettingsSheet() {
  const { showSettings, setShowSettings, transparencyLevel, setTransparencyLevel, modalityMode, setModalityMode, startNewConversation } =
    useStore();

  return (
    <Sheet
      opened={showSettings}
      onBackdropClick={() => setShowSettings(false)}
      className="pb-safe"
    >
      <BlockTitle>Transparency Mode</BlockTitle>
      <List strong inset outline>
        {levels.map((l) => (
          <ListItem
            key={l.value}
            title={l.label}
            subtitle={l.description}
            after={
              <input
                type="radio"
                name="transparency"
                checked={transparencyLevel === l.value}
                onChange={() => setTransparencyLevel(l.value)}
                className="accent-[#7c6aef]"
              />
            }
            onClick={() => setTransparencyLevel(l.value)}
          />
        ))}
      </List>

      <BlockTitle className="mt-2">Input Mode</BlockTitle>
      <List strong inset outline>
        {modalities.map((m) => (
          <ListItem
            key={m.value}
            title={m.label}
            subtitle={m.description}
            after={
              <input
                type="radio"
                name="modality"
                checked={modalityMode === m.value}
                onChange={() => setModalityMode(m.value)}
                className="accent-[#7c6aef]"
              />
            }
            onClick={() => setModalityMode(m.value)}
          />
        ))}
      </List>

      <Block className="mt-4">
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
      </Block>
    </Sheet>
  );
}
