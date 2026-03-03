import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme and language direction early to avoid flash
try {
  const stored = JSON.parse(localStorage.getItem('agentflow_state') || '{}');
  const mode = stored.themeMode ?? 'dark';
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  const lang = stored.language ?? 'en';
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
} catch { document.documentElement.classList.add('dark'); }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
