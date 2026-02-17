import { X } from 'lucide-react';
import { useStore } from '../../state/store';

export default function ImagePreview() {
  const { imagePreview, setImagePreview } = useStore();
  if (!imagePreview) return null;

  return (
    <div className="relative inline-block mb-2">
      <img src={imagePreview} alt="Preview" className="h-16 rounded-xl object-cover" />
      <button
        onClick={() => setImagePreview(null)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"
      >
        <X className="w-3 h-3 text-slate-400" />
      </button>
    </div>
  );
}
