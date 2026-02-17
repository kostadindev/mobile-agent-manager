import { useRef, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { useStore } from '../../state/store';

export default function ImageCapture() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setImagePreview } = useStore();

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

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all active:scale-90"
      >
        <Camera className="w-4 h-4" />
      </button>
    </>
  );
}
