export default function HealthRow({
  label,
  value,
  warning,
  danger,
}: {
  label: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`text-sm font-semibold ${
          danger
            ? "text-red-600"
            : warning
            ? "text-amber-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}