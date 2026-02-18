import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme early to avoid flash of wrong theme
try {
  const stored = JSON.parse(localStorage.getItem('agentflow_state') || '{}');
  const mode = stored.themeMode ?? 'dark';
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
} catch { document.documentElement.classList.add('dark'); }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
