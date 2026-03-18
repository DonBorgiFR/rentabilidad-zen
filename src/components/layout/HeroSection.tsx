import { Users, Home, Building } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ServiceCard } from '../ui';

export function HeroSection() {
  const { setActiveTab } = useAppStore();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center animate-fadeIn relative">
       <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-widest mb-8 border border-white/20 dark:border-white/5">
             <Building size={14} className="text-emerald-500" /> Consultoría de Mercado
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6 drop-shadow-sm">
             El valor real de una <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 italic font-serif">propiedad.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
             Plataforma analítica avanzada para evaluar arrendamientos y adquisiciones. Genera tu <strong className="text-slate-900 dark:text-slate-200">Dossier Inmobiliario</strong> al instante.
          </p>
       </div>
       
       <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
          <ServiceCard 
             icon={<Users size={28} className="text-emerald-500" />}
             title="Inquilinos"
             description="Simula tu ratio de esfuerzo, examina el precio de mercado y prevé tus gastos iniciales antes de alquilar."
             onClick={() => setActiveTab('tenant')}
             buttonLabel="Auditar Alquiler"
             color="emerald"
          />
          <ServiceCard 
             icon={<Home size={28} className="text-blue-500" />}
             title="Propietarios / Inversores"
             description="Analiza la rentabilidad operativa y financiera cruzando OPEX, CAPEX y beneficios fiscales de la legislación actual."
             onClick={() => setActiveTab('landlord')}
             buttonLabel="Generar Dossier ROI"
             color="blue"
          />
       </div>
    </div>
  );
}
