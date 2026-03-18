import { useEffect } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { HeroSection } from './components/layout/HeroSection';
import { Footer } from './components/layout/Footer';
import { TenantDashboard } from './components/tenant/TenantDashboard';
import { LandlordDashboard } from './components/landlord/LandlordDashboard';

export default function App() {
  const { isDark, activeTab, isExporting, setActiveTab } = useAppStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-50 transition-colors duration-500 font-sans pb-20 selection:bg-emerald-500/30">
      
      {/* Vibe: Elegant Architectural Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        <TopNavbar />

        {!activeTab && <HeroSection />}

        {activeTab && (
        <div id="dossier-inmobiliario-bfr" className="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 sm:p-12 shadow-2xl shadow-slate-300/30 dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] mb-8 transition-colors duration-500">
          
          <header className="mb-14 relative z-10 border-b border-slate-200 dark:border-slate-800/60 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition" onClick={() => setActiveTab(null)}>
                  <ChevronDown size={14} className="rotate-90 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Cambiar Dossier</span>
               </div>
               <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                 {activeTab === 'tenant' ? 'Dossier de Inquilino' : 'Dossier de Inversión'}
               </h1>
               <p className="text-sm font-medium text-slate-500 mt-2">
                 {activeTab === 'tenant' ? 'Análisis de viabilidad financiera y tasación de mercado para arrendatarios.' : 'Auditoría de rentabilidad operativa, fiscalidad e impacto del apalancamiento.'}
               </p>
            </div>
            
            {isExporting && (
              <div className="p-4 border border-emerald-500/30 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-4 min-w-[300px]">
                <FileText className="text-emerald-600 dark:text-emerald-400" size={28} />
                <div className="leading-tight">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-600/70 dark:text-emerald-400/70 block mb-1">DOSSIER TÉCNICO BFR</span>
                  <span className="text-sm font-black text-emerald-900 dark:text-emerald-100 uppercase">
                    CONFIDENCIAL
                  </span>
                </div>
              </div>
            )}
          </header>

          <main>
            {activeTab === 'tenant' ? <TenantDashboard /> : <LandlordDashboard />}
          </main>
          
          <Footer />
        </div>
        )}
      </div>
    </div>
  );
}
