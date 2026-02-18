import { Sheet, Button } from 'konsta/react';
import { useStore } from '../../state/store';
import { useT, LANGUAGES } from '../../i18n';
import type { Language } from '../../i18n';

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
      <div className="flex rounded-xl bg-control-bg p-1 gap-1">
        {options.map((o) => {
          const isActive = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6aef] text-white shadow-md'
                  : 'text-on-surface-muted active:bg-hover'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {active && (
        <p className="text-[12px] text-on-surface-muted mt-2 px-1">{active.description}</p>
      )}
    </div>
  );
}

export default function SettingsSheet() {
  const { showSettings, setShowSettings, transparencyLevel, setTransparencyLevel, modalityMode, setModalityMode, themeMode, setThemeMode, language, setLanguage, startNewConversation } =
    useStore();
  const t = useT();

  const levels = [
    { value: 'black_box' as const, label: t('settings.blackBox'), description: t('settings.blackBoxDesc') },
    { value: 'plan_preview' as const, label: t('settings.planPreview'), description: t('settings.planPreviewDesc') },
    { value: 'full_transparency' as const, label: t('settings.fullTransparency'), description: t('settings.fullTransparencyDesc') },
  ];

  const modalities = [
    { value: 'multimodal' as const, label: t('settings.multimodal'), description: t('settings.multimodalDesc') },
    { value: 'text_image' as const, label: t('settings.textImages'), description: t('settings.textImagesDesc') },
    { value: 'voice_only' as const, label: t('settings.voiceOnly'), description: t('settings.voiceOnlyDesc') },
  ];

  const themes = [
    { value: 'dark' as const, label: t('settings.dark'), description: t('settings.darkDesc') },
    { value: 'light' as const, label: t('settings.light'), description: t('settings.lightDesc') },
    { value: 'auto' as const, label: t('settings.auto'), description: t('settings.autoDesc') },
  ];

  const languageOptions = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.label,
    description: '',
  }));

  return (
    <Sheet
      opened={showSettings}
      onBackdropClick={() => setShowSettings(false)}
      className="pb-safe"
    >
      <div className="px-4 py-4 space-y-6">
        <div>
          <p className="text-[13px] font-semibold text-on-surface-muted uppercase tracking-wide mb-2">{t('settings.transparencyMode')}</p>
          <SegmentedControl options={levels} value={transparencyLevel} onChange={setTransparencyLevel} />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-on-surface-muted uppercase tracking-wide mb-2">{t('settings.inputMode')}</p>
          <SegmentedControl options={modalities} value={modalityMode} onChange={setModalityMode} />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-on-surface-muted uppercase tracking-wide mb-2">{t('settings.theme')}</p>
          <SegmentedControl options={themes} value={themeMode} onChange={setThemeMode} />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-on-surface-muted uppercase tracking-wide mb-2">{t('settings.language')}</p>
          <SegmentedControl options={languageOptions} value={language} onChange={(v) => setLanguage(v as Language)} />
        </div>

        <Button
          outline
          onClick={() => {
            startNewConversation();
            setShowSettings(false);
          }}
          className="!text-red-400 !border-red-400/40"
        >
          {t('settings.clearHistory')}
        </Button>
      </div>
    </Sheet>
  );
}
