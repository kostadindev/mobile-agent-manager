import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import PrivacyConsentDialog from '../Privacy/PrivacyConsentDialog';

interface VoiceButtonProps {
  onAudioRecorded: (audioBase64: string) => void;
}

export default function VoiceButton({ onAudioRecorded }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showConsent, setShowConsent] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
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
          if (base64) onAudioRecorded(base64);
        };
        reader.readAsDataURL(blob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert('Microphone access denied.');
    }
  }, [onAudioRecorded]);

  const toggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      // Check consent before recording
      if (!localStorage.getItem('agentflow_media_consent')) {
        setShowConsent(true);
        return;
      }
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const handleConsentAccept = useCallback(() => {
    localStorage.setItem('agentflow_media_consent', 'true');
    setShowConsent(false);
    startRecording();
  }, [startRecording]);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5">
      {isRecording && (
        <span className="text-[11px] text-red-400 font-medium tabular-nums animate-pulse">
          {formatDuration(duration)}
        </span>
      )}
      <button
        onClick={toggle}
        aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
          isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/[0.06] text-slate-500 hover:text-slate-300'
        }`}
      >
        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      <PrivacyConsentDialog
        opened={showConsent}
        onAccept={handleConsentAccept}
        onDecline={() => setShowConsent(false)}
      />
    </div>
  );
}
