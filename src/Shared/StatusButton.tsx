function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusButton({
  title,
  subtitle,
  active,
  disabled,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left text-sm transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <div className="font-medium">{title}</div>
      <div
        className={cn("text-xs", active ? "text-white/80" : "text-slate-500")}
      >
        {subtitle}
      </div>
    </button>
  );
}

export default StatusButton;
