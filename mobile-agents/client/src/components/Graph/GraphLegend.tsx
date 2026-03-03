import { useT } from '../../i18n';

export default function GraphLegend() {
  const t = useT();

  const items = [
    { color: '#475569', label: t('legend.pending') },
    { color: '#3B82F6', label: t('legend.running') },
    { color: '#22C55E', label: t('legend.complete') },
    { color: '#F59E0B', label: t('legend.approval') },
    { color: '#EF4444', label: t('legend.failed') },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[9px] text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
