import { Sun, Moon, Download, Globe, LineChart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { exportToPDF } from '../../lib/PDFGenerator';
import { cn } from '../ui';

export function TopNavbar() {
  const { isDark, setIsDark, activeTab, setActiveTab, isExporting, setIsExporting } = useAppStore();

  return (
    <div className="flex justify-between items-center mb-10 animate-fadeIn backdrop-blur-md bg-white/50 dark:bg-[#0a0f1c]/50 p-4 rounded-3xl border border-white/20 dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab(null)}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-slate-800 dark:to-[#0f172a] overflow-hidden relative group">
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <LineChart size={24} className="group-hover:scale-110 transition-transform duration-500 relative z-10 text-emerald-400" />
           <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div>
           <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              BFR <span className="font-light">Properties</span>
           </h2>
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">Inteligencia Inmobiliaria</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a 
          href="https://borjafelixrojas.odoo.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-all focus:outline-none"
          title="Portal de Consultoría"
        >
          <Globe size={18} />
        </a>
        <button 
           onClick={() => setIsDark(!isDark)}
           className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:text-emerald-600 dark:hover:text-amber-400 transition-all focus:outline-none"
           title="Alternar Tema"
        >
           {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
        {activeTab && (
           <button 
             onClick={async () => {
               setIsExporting(true);
               await new Promise(r => setTimeout(r, 100));
               await exportToPDF('dossier-inmobiliario-bfr', `Dossier-BFR-${activeTab}`);
               setIsExporting(false);
             }}
             className="hidden sm:flex items-center gap-2 ml-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
             disabled={isExporting}
           >
             <Download size={18} className={cn(isExporting && "animate-bounce")} />
             <span className="text-sm tracking-wide">Descargar Dossier</span>
           </button>
        )}
      </div>
    </div>
  );
}
