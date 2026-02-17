import { useRef, useCallback, useState } from 'react';
import { Camera } from 'lucide-react';
import { useStore } from '../../state/store';
import PrivacyConsentDialog from '../Privacy/PrivacyConsentDialog';

export default function ImageCapture() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setImagePreview } = useStore();
  const [showConsent, setShowConsent] = useState(false);

  const handleCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [setImagePreview]
  );

  const openPicker = useCallback(() => {
    if (!localStorage.getItem('agentflow_media_consent')) {
      setShowConsent(true);
      return;
    }
    inputRef.current?.click();
  }, []);

  const handleConsentAccept = useCallback(() => {
    localStorage.setItem('agentflow_media_consent', 'true');
    setShowConsent(false);
    inputRef.current?.click();
  }, []);

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
      <button
        onClick={openPicker}
        aria-label="Take photo or choose image"
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all active:scale-90"
      >
        <Camera className="w-4 h-4" />
      </button>
      <PrivacyConsentDialog
        opened={showConsent}
        onAccept={handleConsentAccept}
        onDecline={() => setShowConsent(false)}
      />
    </>
  );
}
