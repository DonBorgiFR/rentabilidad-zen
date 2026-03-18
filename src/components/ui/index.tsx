import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatEuro = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export function MetricTitle({ title, description, light = false }: { title: string, description: string, light?: boolean }) {
  return (
    <div className="mb-2">
      <h4 className={cn("text-[11px] font-bold uppercase tracking-widest", light ? "text-slate-300" : "text-slate-600 dark:text-slate-400")}>
         {title}
      </h4>
      <p className={cn("text-[10px] mt-1.5 leading-relaxed font-medium", light ? "text-slate-400" : "text-slate-500")}>
         {description}
      </p>
    </div>
  );
}

export function ServiceCard({ icon, title, description, buttonLabel, onClick, color }: any) {
   const colorClasses = color === 'emerald' 
     ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 hover:border-emerald-500" 
     : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 hover:border-blue-500";
   
   return (
      <button 
         onClick={onClick}
         className="group relative p-8 rounded-[2rem] bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 hover:-translate-y-1 transition-all text-left shadow-xl shadow-slate-200/50 dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] cursor-pointer flex flex-col h-full w-full"
      >
         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner", colorClasses)}>
            {icon}
         </div>
         <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h3>
         <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-grow font-medium">
            {description}
         </p>
         <span className={cn("inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-transform mt-auto", color === 'emerald' ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")}>
            {buttonLabel} <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
         </span>
      </button>
   )
}

export function InputSection({ title, children, icon, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0a0f1c]/50 overflow-hidden shadow-sm backdrop-blur-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/80 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="text-slate-500 dark:text-slate-400 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner">{icon}</div>
          <h3 className="font-bold text-sm tracking-widest text-slate-800 dark:text-white uppercase mt-0.5">
            {title}
          </h3>
        </div>
        <ChevronDown className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} size={20} />
      </button>
      
      <div className={cn(
        "transition-all duration-500 ease-in-out px-8 overflow-hidden bg-white dark:bg-transparent",
        isOpen ? "max-h-[2000px] opacity-100 pb-8 opacity-100" : "max-h-0 opacity-0 pb-0"
      )}>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
           {children}
        </div>
      </div>
    </div>
  );
}

export function BooleanToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left focus:outline-none cursor-pointer group",
        checked ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
      )}
    >
      <span className={cn("text-xs font-bold uppercase tracking-wider min-w-0 pr-2 transition-colors", checked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>{label}</span>
      <div className={cn(
        "w-10 h-6 rounded-full flex items-center p-1 transition-colors flex-shrink-0 relative shadow-inner",
        checked ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
      )}>
        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform absolute shadow-sm", checked ? "right-1" : "left-1")} />
      </div>
    </button>
  );
}
