import { LineChart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
       <div className="flex items-center gap-3 opacity-60">
           <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
              <LineChart size={14} />
           </div>
           <div className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              BFR Analytics &copy; 2026
           </div>
       </div>
       <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-sm text-center md:text-right font-medium">
          Dossier heurístico confidencial operado por BFR Properties. Evita riesgos de mercado asegurando la operación con los debidos asesores colegiados inmobiliarios.
       </p>
    </footer>
  );
}
