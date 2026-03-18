import { useState, useMemo, useEffect } from 'react';
import { calculateRentalYield, RentalInputs } from './lib/rental-engine';
import { evaluateTenantScenario, TenantInputs } from './lib/tenant-engine';
import { 
  TrendingUp, Home, ShieldCheck, Euro, Moon, Sun, ChevronDown, Download, Calculator, Target, Building, Users, Globe, LineChart, FileText, ArrowRight, ThumbsUp, ThumbsDown, Check, Loader2
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuditInput } from './components/AuditInput';
import { exportToPDF } from './lib/PDFGenerator';
import { PieChart, Pie, Cell, AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatEuro = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'landlord' | 'tenant' | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (score: number) => {
    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('bfr_feedback_loop')
        .insert({
          tool_id: activeTab,
          feedback_score: score,
          precio_estimado_bfr: activeTab === 'tenant' ? tenantResults.precioEstimadoMercado : landlordResults.noi,
          inputs_json: activeTab === 'tenant' ? (tenantInputs as any) : (inputs as any)
        });
      
      if (error) {
         console.warn("Supabase Warning:", error);
      }
    } catch (err) {
      console.warn("Fetch Exception:", err);
    }
    setFeedbackGiven(true);
    setIsSubmittingFeedback(false);
  };

  // Landlord Inputs
  const [inputs, setInputs] = useState<RentalInputs>({
    precioCompra: 200000,
    itpIva: 10,
    gastosEscritura: 2500,
    reformaCoste: 15000,
    mobiliario: 5000,
    rentaMensual: 950,
    rentaAnterior: 900,
    indiceReferencia: 850,
    zonaTensionada: true,
    tasaVacancia: 4,
    ibi: 450,
    comunidad: 600,
    seguroHogar: 200,
    seguroImpago: 350,
    mantenimientoEstimado: 400,
    tasaBasuras: 60,
    honorariosGestion: 0,
    ltv: 80,
    interes: 3.5,
    plazoAnios: 30,
    comisionApertura: 1000,
    valorCatastralTotal: 100000,
    valorCatastralSueloPct: 20,
    irpfMarginal: 30,
    tipoReduccion: 50,
  });

  const landlordResults = useMemo(() => calculateRentalYield(inputs), [inputs]);

  // Tenant Inputs
  const [tenantInputs, setTenantInputs] = useState<TenantInputs>({
    ingresoNetoMensual: 2500,
    rentaSolicitada: 950,
    mesesFianza: 1,
    mesesGarantiaAdicional: 1,
    otrosGastosIniciales: 500,
    metrosCuadrados: 80,
    zona: 'media',
    estado: 'bueno',
    habitaciones: 2,
    banos: 1,
    planta: 2,
    tieneAscensor: true,
    tieneParking: false,
    tieneTerraza: false,
    tieneAireAcondicionado: true
  });

  const tenantResults = useMemo(() => evaluateTenantScenario(tenantInputs), [tenantInputs]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Data for Charts
  const tenantGaugeData = [
    { name: 'Esfuerzo', value: tenantResults.ratioEsfuerzo, color: tenantResults.esFavorable ? '#10b981' : '#f43f5e' },
    { name: 'Libre', value: Math.max(0, 100 - tenantResults.ratioEsfuerzo), color: isDark ? '#1e293b' : '#f1f5f9' }
  ];

  const initialCashData = [
    { name: 'Primer Mes', value: tenantInputs.rentaSolicitada, color: '#3b82f6' },
    { name: 'Fianza', value: tenantInputs.rentaSolicitada * tenantInputs.mesesFianza, color: '#10b981' },
    { name: 'Garantía Extra', value: tenantInputs.rentaSolicitada * tenantInputs.mesesGarantiaAdicional, color: '#f59e0b' },
    { name: 'Otros (Mudanza)', value: tenantInputs.otrosGastosIniciales, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  const landlordExpensesData = [
    { name: 'Hipoteca', value: landlordResults.cuotaHipotecariaMensual * 12, color: '#3b82f6' },
    { name: 'Comunidad + IBI', value: inputs.comunidad + inputs.ibi, color: '#eab308' },
    { name: 'Seguros', value: inputs.seguroHogar + inputs.seguroImpago, color: '#f97316' },
    { name: 'Mantenimiento', value: inputs.mantenimientoEstimado, color: '#64748b' }
  ].filter(d => d.value > 0);

  const landlordProjectionData = useMemo(() => {
    return Array.from({length: 10}, (_, i) => ({
      year: `Año ${i+1}`,
      FlujoNeto: Math.round(landlordResults.cashFlowAnual * Math.pow(1.02, i)), 
      GastosTotales: Math.round(landlordResults.gastosOperativosAnuales * Math.pow(1.03, i)) 
    }));
  }, [landlordResults.cashFlowAnual, landlordResults.gastosOperativosAnuales]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-50 transition-colors duration-500 font-sans pb-20 selection:bg-emerald-500/30">
      
      {/* Vibe: Elegant Architectural Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        {/* Top Navbar */}
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

        {/* Hero Section if no tab selected */}
        {!activeTab && (
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
        )}

        {/* Dashboard Content */}
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
            {activeTab === 'tenant' ? (
              <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto">
                 {/* Dossier Inquilino - Top Metrics */}
                 <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Ratio de Esfuerzo */}
                    <div className={cn(
                       "relative min-h-[280px] p-8 rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden",
                       tenantResults.esFavorable 
                         ? "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/50" 
                         : "bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-200 dark:border-rose-800/50"
                    )}>
                       <MetricTitle 
                          title="Ratio de Esfuerzo Mensual" 
                          description="Impacto del alquiler sobre tus ingresos netos mensuales garantizados." 
                       />
                       
                       <div className="relative h-[130px] w-full mx-auto -mb-4 mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie data={tenantGaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none" cornerRadius={6}>
                               {tenantGaugeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                             </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute bottom-0 left-0 right-0 text-center flex justify-center items-end pb-1">
                            <span className={cn("text-5xl font-black drop-shadow-sm", tenantResults.esFavorable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                               {tenantResults.ratioEsfuerzo.toFixed(1)}<span className="text-2xl opacity-75">%</span>
                            </span>
                         </div>
                       </div>
                    </div>

                    {/* Efectivo Inicial */}
                    <div className="relative min-h-[280px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                       <div>
                          <MetricTitle 
                             title="Desembolso Inicial" 
                             description="Efectivo líquido calculado para la firma de contrato incluyendo provisión de mudanza." 
                          />
                          <div className="text-4xl font-black text-slate-900 dark:text-white mt-4">
                             {formatEuro(tenantResults.pagoInicialRequerido)}
                          </div>
                       </div>

                       <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                           <div className="flex h-4 w-full rounded-full overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800">
                             {initialCashData.map(d => (
                               <div key={d.name} style={{ width: `${(d.value / tenantResults.pagoInicialRequerido) * 100}%`, backgroundColor: d.color }} className="relative border-r border-white/20 last:border-0 hover:brightness-110 transition-all cursor-pointer" title={`${d.name}: ${formatEuro(d.value)}`} />
                             ))}
                           </div>
                           <div className="grid grid-cols-2 gap-y-3 mt-5">
                             {initialCashData.map(d => (
                               <div key={d.name} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                 <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
                                 <span className="truncate" title={d.name}>{d.name}</span>
                               </div>
                             ))}
                           </div>
                       </div>
                    </div>

                    {/* Comparador de Mercado */}
                    <div className={cn(
                       "relative min-h-[280px] p-8 rounded-3xl border shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1",
                       tenantResults.diferenciaPorcentaje > 5 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50" 
                       : tenantResults.diferenciaPorcentaje < -5 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
                       : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50"
                    )}>
                       <div>
                          <MetricTitle 
                             title="Veredicto Estructural" 
                             description="Evaluación de la renta solicitada vs tasación heurística." 
                          />
                          <div className={cn(
                             "text-3xl font-black uppercase tracking-tight mt-2",
                             tenantResults.diferenciaPorcentaje > 5 ? "text-amber-600" 
                             : tenantResults.diferenciaPorcentaje < -5 ? "text-emerald-600"
                             : "text-blue-600"
                          )}>
                             {tenantResults.veredictoPrecio}
                          </div>
                       </div>
                       
                       <div className="my-6">
                          <div className="relative w-full h-3 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10 opacity-50"></div>
                             <div 
                                className={cn("absolute top-0 h-full rounded-full transition-all duration-700", tenantResults.diferenciaPorcentaje > 5 ? "bg-rose-500" : tenantResults.diferenciaPorcentaje < -5 ? "bg-emerald-500" : "bg-blue-500")}
                                style={{ 
                                   left: tenantResults.diferenciaPorcentaje > 0 ? '50%' : `${Math.max(0, 50 + tenantResults.diferenciaPorcentaje)}%`,
                                   width: `${Math.min(50, Math.abs(tenantResults.diferenciaPorcentaje))}%` 
                                }} 
                             />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-2 px-1">
                             <span>(-50%)</span>
                             <span>Mercado</span>
                             <span>(+50%)</span>
                          </div>
                       </div>

                       <div className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center bg-white/60 dark:bg-slate-950/40 p-4 rounded-xl border border-white/40 dark:border-slate-800/50 backdrop-blur-sm">
                          <span>Tasación Modelo:</span>
                          <span className="text-lg font-black">{formatEuro(tenantResults.precioEstimadoMercado)}</span>
                       </div>
                    </div>
                 </div>

                 {/* Ajuste de inputs - Dossier Layout (Apilados verticalmente para lectura cómoda) */}
                 <div className="flex flex-col gap-8">
                    <InputSection title="Ficha Financiera y Contrato" icon={<Calculator size={20}/>} defaultOpen={true}>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <AuditInput label="Ingreso Neto Mensual" prefix="€" value={tenantInputs.ingresoNetoMensual} onChange={v => setTenantInputs({...tenantInputs, ingresoNetoMensual: v})} tooltip="Suma solo ingresos fijos, recurrentes y comprobables por nómina."/>
                          <AuditInput label="Renta Solicitada" prefix="€" value={tenantInputs.rentaSolicitada} onChange={v => setTenantInputs({...tenantInputs, rentaSolicitada: v})} tooltip="Canon mensual exigido por el propietario."/>
                          <AuditInput label="Fianza de Ley (LAU)" suffix="mes/es" step={1} min={1} value={tenantInputs.mesesFianza} onChange={v => setTenantInputs({...tenantInputs, mesesFianza: v})} tooltip="Obligatorio por ley en España: 1 mes para vivienda habitual." />
                          <AuditInput label="Garantía Adicional" suffix="mes/es" step={1} min={0} value={tenantInputs.mesesGarantiaAdicional} onChange={v => setTenantInputs({...tenantInputs, mesesGarantiaAdicional: v})} tooltip="El arrendador puede exigir hasta un máximo de 2 meses extra de aval o depósito."/>
                          <div className="md:col-span-2">
                             <AuditInput label="Presupuesto de Adecuación (Mudanza y Altas)" prefix="€" value={tenantInputs.otrosGastosIniciales} onChange={v => setTenantInputs({...tenantInputs, otrosGastosIniciales: v})} tooltip="Dinero necesario para la mudanza, comprar mobiliario faltante o pagar altas de luz y agua si aplica." />
                          </div>
                       </div>
                    </InputSection>

                    <InputSection title="Perfil Estructural del Inmueble" icon={<Target size={20}/>} defaultOpen={true}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          
                          <div className="flex flex-col gap-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Micro-Zonificación</label>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-1 leading-snug font-medium pr-2">La valoración fluctúa según el barrio.</p>
                             <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                               value={tenantInputs.zona} onChange={e => setTenantInputs({...tenantInputs, zona: e.target.value as any})}
                             >
                                <option value="premium">Distrito Premium / CBD</option>
                                <option value="tensionada">Área Tensionada (Poblada)</option>
                                <option value="media">Residencial Consolidada/Media</option>
                                <option value="periferia">Periferia Urbana Expansión</option>
                             </select>
                          </div>

                          <div className="flex flex-col gap-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Conservación</label>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-1 leading-snug font-medium pr-2">Estado actual de habitabilidad del piso.</p>
                             <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                               value={tenantInputs.estado} onChange={e => setTenantInputs({...tenantInputs, estado: e.target.value as any})}
                             >
                                <option value="nuevo">Promoción Obra Nueva</option>
                                <option value="reformado">Reforma Integral Reciente</option>
                                <option value="bueno">Buen Estado de Conservación</option>
                                <option value="origen">De Origen / Requiere Mejoras</option>
                             </select>
                          </div>

                          <AuditInput label="Área Construida" suffix="m²" value={tenantInputs.metrosCuadrados} onChange={v => setTenantInputs({...tenantInputs, metrosCuadrados: v})} tooltip="Superficie comercial real con áreas comunes." />
                          <AuditInput label="Nivel / Planta" step={1} min={0} value={tenantInputs.planta || 1} onChange={v => setTenantInputs({...tenantInputs, planta: v})} tooltip="Pisos bajos/sótanos disminuyen el valor de mercado." />
                          <AuditInput label="Dormitorios" step={1} min={1} value={tenantInputs.habitaciones} onChange={v => setTenantInputs({...tenantInputs, habitaciones: v})} tooltip="Total de habitaciones dedicadas al descanso."/>
                          <AuditInput label="Cuartos de Baño" step={1} min={1} value={tenantInputs.banos} onChange={v => setTenantInputs({...tenantInputs, banos: v})} tooltip="Incluye aseos de servicio básicos."/>
                          
                          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                             <BooleanToggle label="Ascensor" checked={tenantInputs.tieneAscensor} onChange={v => setTenantInputs({...tenantInputs, tieneAscensor: v})} />
                             <BooleanToggle label="Pza. Parking" checked={tenantInputs.tieneParking} onChange={v => setTenantInputs({...tenantInputs, tieneParking: v})} />
                             <BooleanToggle label="Terraza/Exterior" checked={tenantInputs.tieneTerraza} onChange={v => setTenantInputs({...tenantInputs, tieneTerraza: v})} />
                             <BooleanToggle label="Climatización A/C" checked={tenantInputs.tieneAireAcondicionado} onChange={v => setTenantInputs({...tenantInputs, tieneAireAcondicionado: v})} />
                          </div>
                          
                          {!isExporting && (
                             <div className="md:col-span-2 lg:col-span-3 mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                                <div className="text-sm">
                                   <p className="font-bold text-slate-800 dark:text-white">¿Ayúdanos a calibrar el algoritmo?</p>
                                   <p className="text-slate-500 font-medium text-xs mt-1">Comparando el piso real con nuestra tasación ({formatEuro(tenantResults.precioEstimadoMercado)}), ¿quién es más acertado?</p>
                                </div>
                                <div className="flex gap-2">
                                   {feedbackGiven ? (
                                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full"><Check size={14}/> Feedback Guardado</span>
                                   ) : isSubmittingFeedback ? (
                                      <span className="flex items-center gap-2 text-slate-500 font-bold p-2"><Loader2 size={16} className="animate-spin"/> </span>
                                   ) : (
                                      <>
                                       <button onClick={() => handleFeedbackSubmit(1)} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 transition-colors shadow-sm" title="Tasación precisa"><ThumbsUp size={18}/></button>
                                       <button onClick={() => handleFeedbackSubmit(-1)} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 transition-colors shadow-sm" title="Poco acertada o irreal"><ThumbsDown size={18}/></button>
                                      </>
                                   )}
                                </div>
                             </div>
                          )}
                       </div>
                    </InputSection>
                 </div>
              </div>
            ) : (
              <div className="animate-fadeIn max-w-6xl mx-auto">
                 {/* Landlord Dashboard */}
                 <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-12 items-stretch">
                    
                    {/* ROE Card */}
                    <div className="md:col-span-2 lg:col-span-2 min-h-[260px] p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-black dark:from-[#0a0f1c] dark:to-black border border-slate-800 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
                       <div className="relative z-10">
                          <MetricTitle light title="Retorno S/ Capital Entregado (ROE)" description="El ratio rey de la rentabilidad. Dinero de tu bolsillo rendiendo flujo libre." />
                          <div className="text-6xl lg:text-7xl font-black tracking-tighter flex items-center gap-2 mt-4">
                             {landlordResults.roe.toFixed(2)}<span className="text-3xl text-slate-400 font-bold ml-1">%</span>
                          </div>
                       </div>
                       <div className="relative z-10 mt-auto flex items-center justify-between text-[11px] font-bold py-3 px-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                          <span className="text-slate-300 uppercase tracking-widest leading-relaxed">Ciclo de Recuperación del Capital Operativo:</span>
                          <span className="text-emerald-400 text-sm">{landlordResults.paybackYears === Infinity ? 'Infinito' : `${landlordResults.paybackYears.toFixed(1)} Años`}</span>
                       </div>
                    </div>
                    
                    {/* 10 Year Cash Flow projection */}
                    <div className="lg:col-span-2 md:col-span-2 min-h-[260px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                       <div className="relative z-10 flex justify-between items-start mb-6">
                          <div className="max-w-[70%]">
                             <MetricTitle title="Rendimiento Futuro (10 Y)" description="Proyección económica tras pagar hipoteca y liquidar IRPF anual." />
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Cashflow A1</span>
                             <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatEuro(landlordResults.cashFlowAnual)}</div>
                          </div>
                       </div>
                       
                       <div className="absolute bottom-0 left-0 right-0 h-36 opacity-90">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={landlordProjectionData} margin={{ top: 5, right: -5, left: -5, bottom: 0 }}>
                               <defs>
                                 <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <Tooltip 
                                  formatter={(value: number) => formatEuro(value)}
                                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                  cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                               />
                               <Area type="monotone" dataKey="FlujoNeto" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNeto)" />
                               <Area type="monotone" dataKey="GastosTotales" stroke="#64748b" strokeWidth={2} fillOpacity={0} strokeDasharray="4 4"/>
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* NOI + Cap Rate Bruto */}
                    <div className="md:col-span-1 lg:col-span-2 min-h-[220px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                       <MetricTitle title="Net Operating Income (NOI)" description="El corazón operativo del activo. Ingresos menos operativos, descarta tu deuda (hipoteca) para evidenciar su competitividad tasable." />
                       <div className="text-4xl font-black text-slate-900 dark:text-white mt-auto mb-6">
                          {formatEuro(landlordResults.noi)}
                       </div>
                       
                       {/* Badge Cap Rate */}
                       <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                           <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest pl-1">Cap Rate (Bruto)</span>
                           <div className="px-4 py-1.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/30 text-white font-black text-base flex justify-center min-w-[70px]">
                               {resultsToCapRate(landlordResults.noi, inputs.precioCompra)}%
                           </div>
                       </div>
                    </div>

                    {/* Opex Pie Chart */}
                    <div className="md:col-span-1 lg:col-span-2 min-h-[220px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                       <MetricTitle title="Distribución Opex" description="Estructura y peso de gastos obligatorios fijos (Hipoteca, Recibos de Estado, Seguros)." />
                       <div className="flex-1 flex items-center justify-between mt-2">
                           <div className="h-28 w-28 relative flex-shrink-0">
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie data={landlordExpensesData} innerRadius={35} outerRadius={54} paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}>
                                   {landlordExpensesData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                                 </Pie>
                                 <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
                               </PieChart>
                             </ResponsiveContainer>
                           </div>
                           <div className="flex-1 pl-6 flex flex-col justify-center gap-2.5 overflow-hidden">
                              {landlordExpensesData.slice(0, 3).map(e => (
                                 <div key={e.name} className="flex justify-between items-center text-[11px] font-bold">
                                     <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 max-w-[70%]">
                                         <div className="w-2.5 h-2.5 rounded shadow-sm flex-shrink-0" style={{backgroundColor: e.color}}/>
                                         <span className="truncate">{e.name}</span>
                                     </div>
                                     <span className="text-slate-900 dark:text-white ml-2">{formatEuro(e.value)}</span>
                                 </div>
                              ))}
                           </div>
                       </div>
                    </div>
                 </div>

                 {/* Inputs Configuración - Estilo Dossier Stacked */}
                 <div className="flex flex-col gap-8">
                    <InputSection title="I. Capital Expenditure (CAPEX)" icon={<TrendingUp size={20}/>} defaultOpen={true}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <AuditInput label="Valor Base Compra" prefix="€" value={inputs.precioCompra} onChange={v => setInputs({...inputs, precioCompra: v})} tooltip="El valor crudo registrado en escrituras. Base del ITP."/>
                          <AuditInput label="Trasmisiones/IVA" suffix="%" value={inputs.itpIva} onChange={v => setInputs({...inputs, itpIva: v})} step={0.5} tooltip="El porcentaje del ITP local (o 10% IVA para Nueva Construcción)."/>
                          <AuditInput label="Inversión Reforma" prefix="€" value={inputs.reformaCoste + inputs.mobiliario} onChange={v => setInputs({...inputs, reformaCoste: v})} tooltip="Suma del dinero en equipamiento, lavado de cara o amoblado integral."/>
                          <AuditInput label="Notaría y Extras" prefix="€" value={inputs.gastosEscritura} onChange={v => setInputs({...inputs, gastosEscritura: v})} tooltip="Notario, Registro Público y posible tasadora asociada al proceso."/>
                       </div>
                    </InputSection>
                    
                    <InputSection title="II. Operativa Anual Bruta" icon={<Euro size={20} />} defaultOpen={true}>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <AuditInput label="Aforo Renta Mensual" prefix="€" value={inputs.rentaMensual} onChange={v => setInputs({...inputs, rentaMensual: v})} tooltip="Monto a solicitar en mercado." />
                          <AuditInput label="Holgura / Vacancia" suffix="%" value={inputs.tasaVacancia} onChange={v => setInputs({...inputs, tasaVacancia: v})} step={1} tooltip="Descuenta un margen anual de ingresos para prepararse contra meses nulos predecibles y cambio del inquilino." />
                          
                          <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                             <BooleanToggle label="Activo Declarado en Zona Tensionada Estatal" checked={inputs.zonaTensionada} onChange={v => setInputs({...inputs, zonaTensionada: v})} />
                          </div>
                          {inputs.zonaTensionada && (
                            <div className="md:col-span-2 -mx-2 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all">
                               <AuditInput label="Renta del Contrato Antiguo" prefix="€" value={inputs.rentaAnterior || 0} onChange={v => setInputs({...inputs, rentaAnterior: v})} tooltip="Clave legal (Ley 12/2023): Limita las pretensiones y bloquea al propietario de exigir más dinero percutiendo tu capacidad de Cap Rate, con excepciones tasadas por reforma."/>
                            </div>
                          )}
                       </div>
                    </InputSection>

                    <InputSection title="III. Modelo de Apalancamiento D/E" icon={<Building size={20}/>}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <AuditInput label="Ratio Financiado (LTV)" suffix="%" value={inputs.ltv} onChange={v => setInputs({...inputs, ltv: v})} step={5} tooltip="Porcentaje bancario inyectado por el prestamista (Ej: 80% lo fondea el banco, 20% es tu Equity inicial)." />
                          <AuditInput label="TIN Ponderado" suffix="%" value={inputs.interes} onChange={v => setInputs({...inputs, interes: v})} step={0.1} tooltip="Interés puro (TIN) del apalancamiento."/>
                          <AuditInput label="Ciclo Amortiza." suffix="Años" value={inputs.plazoAnios} onChange={v => setInputs({...inputs, plazoAnios: v})} step={1} tooltip="Horizonte temporal del préstamo concedido." />
                          <AuditInput label="Costes Operación" prefix="€" value={inputs.comisionApertura} onChange={v => setInputs({...inputs, comisionApertura: v})} tooltip="Costes explícitos por abrir dicho volumen de deuda." />
                       </div>
                    </InputSection>

                    <InputSection title="IV. Estructura Fija OPEX y FISCALIDAD" icon={<ShieldCheck size={20}/>}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <AuditInput label="Comunidad/Seguridad" prefix="€" value={inputs.comunidad / 12} onChange={v => setInputs({...inputs, comunidad: v * 12})} tooltip="Costo fijo comunal del inmueble anualizado para modelo." />
                          <AuditInput label="Tributos Recurrentes" prefix="€" value={inputs.ibi} onChange={v => setInputs({...inputs, ibi: v})} tooltip="Anualidad agregada de las obligaciones municipales y catastrales (IBI y Basuras locales)."/>
                          <AuditInput label="Pólizas y Coberturas" prefix="€" value={inputs.seguroHogar + inputs.seguroImpago} onChange={v => setInputs({...inputs, seguroHogar: v})} tooltip="Riesgos externalizados (AR / Seguro de alquiler, Responsabilidad Civil)." />
                          <AuditInput label="Derramas Reservadas" prefix="€" value={inputs.mantenimientoEstimado} onChange={v => setInputs({...inputs, mantenimientoEstimado: v})} tooltip="Presupuesto bloqueado anual para contingencias."/>
                          <AuditInput label="Presión IRPF Tranch" suffix="%" value={inputs.irpfMarginal} onChange={v => setInputs({...inputs, irpfMarginal: v})} step={1} tooltip="Escalón de tu declaración sobre rendimientos devengado para restar del cash free."/>
                          
                          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/50 mt-1 md:col-span-2 lg:col-span-3">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Margen Escudo Fiscal Aplicable</label>
                             <p className="text-[11px] text-slate-500 font-medium mb-1">Manejar este porcentaje es crítico bajo el marco estatal actual para no estrangular el margen libre de impuestos sobre rendimientos del capital inmobiliario a descontar.</p>
                             <select 
                               className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                               value={inputs.tipoReduccion}
                               onChange={(e) => setInputs({...inputs, tipoReduccion: parseInt(e.target.value) as any})}
                             >
                                <option value={50}>Deducción Base Ordinaria P. Física (50%)</option>
                                <option value={60}>Obras Certificadas Mejora Eficiencia Energética (60%)</option>
                                <option value={70}>Nuevo Régimen a Jóvenes (Primer contrato ≤35a) (70%)</option>
                                <option value={90}>Zona T. (Acogido a Reducción Pactada -5%) (90%)</option>
                             </select>
                          </div>
                       </div>
                    </InputSection>
                 </div>
              </div>
            )}
          </main>
          
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
        </div>
        )}
      </div>
    </div>
  );
}

// UI Helpers

function resultsToCapRate(noi: number, precioCompra: number) {
   if (precioCompra === 0) return 0;
   return ((noi / precioCompra) * 100).toFixed(1);
}

function MetricTitle({ title, description, light = false }: { title: string, description: string, light?: boolean }) {
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

function ServiceCard({ icon, title, description, buttonLabel, onClick, color }: any) {
   const colorClasses = color === 'emerald' 
     ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 hover:border-emerald-500" 
     : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 hover:border-blue-500";
   
   return (
      <button 
         onClick={onClick}
         className="group relative p-8 rounded-[2rem] bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 hover:-translate-y-1 transition-all text-left shadow-xl shadow-slate-200/50 dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] cursor-pointer flex flex-col h-full"
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



function InputSection({ title, children, icon, defaultOpen = false }: any) {
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

function BooleanToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
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
