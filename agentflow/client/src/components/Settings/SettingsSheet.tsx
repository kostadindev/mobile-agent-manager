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

export default function SettingsSheet() {
  const { showSettings, setShowSettings, transparencyLevel, setTransparencyLevel, clearHistory } =
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

      <Block className="mt-4">
        <Button
          outline
          onClick={() => {
            clearHistory();
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
