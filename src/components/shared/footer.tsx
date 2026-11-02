export function Footer() {
  return (
    <div className="pointer-events-none fixed bottom-2 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="px-3 py-1 rounded-full bg-white/55 dark:bg-slate-900/55 backdrop-blur-xl border border-white/50 dark:border-slate-700/40 shadow-sm">
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide whitespace-nowrap">
          <span className="font-semibold text-slate-700 dark:text-slate-200">RentEase</span> · Rental management
        </p>
      </div>
    </div>
  );
}
