const items = [
  { color: '#475569', label: 'Pending' },
  { color: '#3B82F6', label: 'Running' },
  { color: '#22C55E', label: 'Complete' },
  { color: '#F59E0B', label: 'Approval' },
  { color: '#EF4444', label: 'Failed' },
];

export default function GraphLegend() {
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
