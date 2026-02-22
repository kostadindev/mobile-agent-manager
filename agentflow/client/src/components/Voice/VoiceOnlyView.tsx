import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Settings, Trash2, Loader2 } from 'lucide-react';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';
import PrivacyConsentDialog from '../Privacy/PrivacyConsentDialog';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceOnlyView() {
  const { messages, isLoading, sendChat, setShowSettings, startNewConversation } = useStore();
  const t = useT();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [duration, setDuration] = useState(0);
  const [showConsent, setShowConsent] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const prevMessageCountRef = useRef(messages.length);

  // Watch for new assistant messages and auto-speak them
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (messages.length > prevCount) {
      const latest = messages[messages.length - 1];
      if (latest.role === 'assistant' && latest.content) {
        // Strip markdown for cleaner speech
        const plainText = latest.content
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/---/g, '')
          .trim();

        setResponseText(plainText);
        speakResponse(plainText);
      }
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Update state when loading changes
  useEffect(() => {
    if (isLoading && voiceState === 'listening') {
      setVoiceState('processing');
    }
    if (!isLoading && voiceState === 'processing' && !speechSynthesis.speaking) {
      // Will transition to 'speaking' when response arrives, or back to idle
    }
  }, [isLoading, voiceState]);

  const speakResponse = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => {
      setVoiceState('idle');
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setVoiceState('idle');
      utteranceRef.current = null;
    };
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = null;
    setVoiceState('idle');
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    // Stop any ongoing speech
    speechSynthesis.cancel();
    utteranceRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          if (base64) {
            setVoiceState('processing');
            setTranscript('');
            sendChat('', undefined, 'voice', base64);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setVoiceState('listening');
      setResponseText('');
      setTranscript('');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert(t('voice.micDenied'));
      setVoiceState('idle');
    }
  }, [sendChat, t]);

  const handleMicTap = useCallback(() => {
    if (voiceState === 'listening') {
      stopRecording();
      return;
    }

    if (voiceState === 'speaking') {
      stopSpeaking();
      return;
    }

    if (voiceState === 'processing') return;

    // idle — start recording
    if (!localStorage.getItem('agentflow_media_consent')) {
      setShowConsent(true);
      return;
    }
    startRecording();
  }, [voiceState, stopRecording, stopSpeaking, startRecording]);

  const handleConsentAccept = useCallback(() => {
    localStorage.setItem('agentflow_media_consent', 'true');
    setShowConsent(false);
    startRecording();
  }, [startRecording]);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const statusLabel = {
    idle: t('voiceView.tapToSpeak'),
    listening: t('voiceView.listening'),
    processing: t('voiceView.thinking'),
    speaking: t('voiceView.speaking'),
  }[voiceState];

  // Find the last user voice transcript to display
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user' && m.inputModality === 'voice');
  const displayTranscript = transcript || lastUserMsg?.content || '';

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-safe-t py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c6aef] to-[#a855f7] flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-on-surface">{t('app.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={startNewConversation} className="p-2 rounded-full hover:bg-hover transition-colors">
              <Trash2 className="w-5 h-5 text-slate-400" />
            </button>
          )}
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-hover transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Response text area */}
        <div className="w-full max-w-sm min-h-[120px] flex items-end justify-center mb-8">
          {voiceState === 'processing' ? (
            <div className="flex items-center gap-2 text-on-surface-muted">
              <Loader2 className="w-5 h-5 animate-spin text-[#7c6aef]" />
              <span className="text-sm">{statusLabel}</span>
            </div>
          ) : responseText ? (
            <p className="text-center text-sm text-on-surface-secondary leading-relaxed max-h-[200px] overflow-y-auto">
              {responseText}
            </p>
          ) : displayTranscript && voiceState === 'idle' ? (
            <p className="text-center text-sm text-on-surface-muted italic">
              &ldquo;{displayTranscript}&rdquo;
            </p>
          ) : null}
        </div>

        {/* Mic button with pulse rings */}
        <div className="relative mb-8">
          {/* Pulse rings for listening state */}
          {voiceState === 'listening' && (
            <>
              <div className="absolute inset-0 -m-4 rounded-full bg-[#7c6aef]/20 animate-ping" />
              <div className="absolute inset-0 -m-8 rounded-full bg-[#7c6aef]/10 animate-ping [animation-delay:300ms]" />
            </>
          )}

          {/* Speaking glow */}
          {voiceState === 'speaking' && (
            <div className="absolute inset-0 -m-4 rounded-full bg-[#a855f7]/20 animate-pulse" />
          )}

          <button
            onClick={handleMicTap}
            disabled={voiceState === 'processing'}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              voiceState === 'listening'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : voiceState === 'processing'
                  ? 'bg-surface-2 text-on-surface-muted cursor-wait'
                  : voiceState === 'speaking'
                    ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
                    : 'bg-gradient-to-br from-[#7c6aef] to-[#a855f7] text-white shadow-lg shadow-[#7c6aef]/30'
            }`}
          >
            {voiceState === 'processing' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status label & duration */}
        <div className="flex flex-col items-center gap-1">
          <span className={`text-sm font-medium ${
            voiceState === 'listening' ? 'text-red-400' :
            voiceState === 'speaking' ? 'text-[#a855f7]' :
            'text-on-surface-muted'
          }`}>
            {statusLabel}
          </span>
          {voiceState === 'listening' && (
            <span className="text-xs text-red-400/80 tabular-nums animate-pulse">
              {formatDuration(duration)}
            </span>
          )}
          {voiceState === 'speaking' && (
            <span className="text-xs text-on-surface-muted">
              {t('voiceView.tapToStop')}
            </span>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex-shrink-0 pb-safe-b px-6 py-4 text-center">
        <p className="text-xs text-on-surface-muted opacity-60">
          {t('voiceView.hint')}
        </p>
      </div>

      <PrivacyConsentDialog
        opened={showConsent}
        onAccept={handleConsentAccept}
        onDecline={() => setShowConsent(false)}
      />
    </div>
  );
}
