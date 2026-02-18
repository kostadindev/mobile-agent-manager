# i18n — Internationalization Guide

AgentFlow supports multiple languages with RTL (right-to-left) layout support. This guide explains how the system works and how to extend it.

## Supported Languages

| Code | Language              | Direction |
|------|-----------------------|-----------|
| `en` | English               | LTR       |
| `ar` | Egyptian Arabic       | RTL       |
| `zh` | Chinese (Simplified)  | LTR       |
| `bg` | Bulgarian             | LTR       |

## Architecture

```
src/i18n/
├── index.ts   ← useT() hook, Language type, LANGUAGES metadata
├── en.ts      ← English translations + TranslationKey / Translations types
├── ar.ts      ← Arabic translations
├── zh.ts      ← Chinese translations
├── bg.ts      ← Bulgarian translations
└── README.md  ← This file
```

**Zero dependencies.** The system uses a plain `Record<TranslationKey, string>` dictionary per language, a Zustand store selector, and a `useCallback`-memoized lookup function.

## Usage in Components

```tsx
import { useT } from '../../i18n';

export default function MyComponent() {
  const t = useT();

  return <h1>{t('app.title')}</h1>;
}
```

### Interpolation

Use `{varName}` placeholders in translation strings:

```ts
// en.ts
'agents.nTools': '{count} tools',

// component
t('agents.nTools', { count: String(agent.capabilities.length) })
```

### Outside React (Zustand store)

Hooks can't be used outside React components. Import the dictionaries directly:

```ts
import { dictionaries } from '../i18n';

// inside a store action:
const dict = dictionaries[get().language] ?? dictionaries.en;
dict['msg.error']; // → translated string
```

## Adding a New Language

1. **Create the translation file** — e.g. `src/i18n/fr.ts`:

```ts
import type { Translations } from './en';

const fr: Translations = {
  'app.title': 'AgentFlow',
  'app.subtitle': 'Votre équipe IA',
  // ... every key from TranslationKey must be present (enforced at compile time)
};

export default fr;
```

2. **Register it in `index.ts`**:

```ts
import fr from './fr';

export type Language = 'en' | 'ar' | 'zh' | 'bg' | 'fr';

export const LANGUAGES: { code: Language; label: string }[] = [
  // ...existing entries
  { code: 'fr', label: 'Français' },
];

export const dictionaries: Record<Language, Translations> = { en, ar, zh, bg, fr };
```

3. **If the language is RTL**, add its code to the RTL check in two places:

- `App.tsx` → `useDirection()`:
  ```ts
  const dir = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';
  ```
- `main.tsx` → early application block:
  ```ts
  document.documentElement.dir = (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr';
  ```

4. **Done.** The language will automatically appear in Settings. TypeScript will error if any key is missing from your new file.

## Adding a New Translation Key

1. **Add the key to `TranslationKey`** in `en.ts`:

```ts
export type TranslationKey =
  // ...existing keys
  | 'myFeature.label';
```

2. **Add the English value** in the `en` object:

```ts
'myFeature.label': 'My Feature',
```

3. **Add translations to every other language file** (`ar.ts`, `zh.ts`, `bg.ts`). TypeScript will show compile errors for any file missing the new key.

4. **Use it** in your component:

```tsx
t('myFeature.label')
```

## RTL Support

When Arabic (or any RTL language) is selected:

- `dir="rtl"` and `lang="ar"` are set on `<html>` (both at startup in `main.tsx` and reactively in `App.tsx`)
- Tailwind logical properties handle layout flipping automatically

### Directional Class Equivalents

Use logical properties instead of physical directions:

| Physical (avoid) | Logical (use)  |
|-------------------|----------------|
| `ml-4`            | `ms-4`         |
| `mr-4`            | `me-4`         |
| `pl-4`            | `ps-4`         |
| `pr-4`            | `pe-4`         |
| `text-left`       | `text-start`   |
| `text-right`      | `text-end`     |
| `left-0`          | `start-0`      |
| `right-0`         | `end-0`        |

### What NOT to Translate

- Agent names from `DEFAULT_AGENTS` (server/LLM data)
- Agent backstories and system prompts (LLM instructions)
- `aria-label` attributes (kept in English for screen readers)
- Capability/tool names (e.g. `arxiv_search`)
- Dynamic LLM output in message bubbles

## Persistence

The selected language is stored in `localStorage` under the `agentflow_state` key alongside other settings (theme, modality mode, etc.). It defaults to `'en'` if not set.

## Verification Checklist

When adding or modifying translations:

- [ ] `npx tsc --noEmit` passes (no missing keys)
- [ ] Switch to each language in Settings → all UI text updates
- [ ] Switch to Arabic → layout mirrors correctly (margins, text alignment)
- [ ] Refresh the page → language persists
- [ ] New conversation suggestions appear in the selected language
