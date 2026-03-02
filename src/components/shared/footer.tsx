export function Footer() {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 select-none">
      <div className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-sm">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide whitespace-nowrap">
          Made with <span className="text-red-400">&#10084;</span> &middot; <span className="font-bold text-slate-700 dark:text-slate-200">RentEase</span> &middot; Cc- Ravi Raj
        </p>
      </div>
    </div>
  );
}
