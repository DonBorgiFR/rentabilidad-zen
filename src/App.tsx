import { useState, useMemo, useEffect } from 'react';
import { calculateRentalYield, RentalInputs } from './lib/rental-engine';
import { 
  TrendingUp,
  Home, 
  Scale, 
  ShieldCheck, 
  Euro,
  Moon,
  Sun,
  ChevronDown,
  Download,
  Share2,
  Calculator,
  History,
  Target,
  CheckCircle2,
  Building,
  Users,
  Info,
  Lightbulb,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZenInput } from './components/ZenInput';
import { exportToPDF } from './lib/PDFGenerator';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatEuro = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'landlord' | 'tenant'>('landlord');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tenantScenario, setTenantScenario] = useState<{name: string, income: number}>({ name: 'Perfil Estándar', income: 2500 });

  const tenantScenarios = [
    { name: 'Perfil Estándar', income: 2500 },
    { name: 'Joven (18-35)', income: 1800 },
    { name: 'Pareja Senior', income: 4200 },
    { name: 'Riesgo / Precariedad', income: 1200 }
  ];

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

  const results = useMemo(() => calculateRentalYield(inputs), [inputs]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const chartData = [
    { name: 'Flujo Caja', value: Math.max(0, results.cashFlowAnual), color: '#10b981' },
    { name: 'Gastos Op.', value: results.gastosOperativosAnuales, color: '#3b82f6' },
    { name: 'Hipoteca', value: results.cuotaHipotecariaMensual * 12, color: '#f59e0b' },
    { name: 'Impuestos', value: results.cuotaIrpfAnual, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-emerald-500/30 transition-colors duration-500 font-sans pb-20">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 dark:bg-emerald-600/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-400/20 dark:bg-blue-600/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-purple-400/20 dark:bg-purple-600/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-12 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <Building size={20} />
            </div>
            <a href="https://borjafelixrojas.odoo.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-black tracking-[0.3em] hidden sm:block uppercase hover:text-emerald-500 transition-colors">
              BFR · CONTROL DE GESTIí“N
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://borjafelixrojas.odoo.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-110 hover:text-emerald-500 transition-all focus:outline-none"
              title="Visitar Web"
            >
              <Globe size={20} />
            </a>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-110 transition-all focus:outline-none"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <button 
              onClick={async () => {
                setIsExporting(true);
                await new Promise(r => setTimeout(r, 100));
                await exportToPDF('rental-app-content', 'Informe-Rentabilidad-Zen-BFR');
                setIsExporting(false);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              disabled={isExporting}
            >
              <Download size={18} className={cn(isExporting && "animate-bounce")} />
              <span className="hidden sm:inline">{isExporting ? 'Generando...' : 'Exportar Informe'}</span>
            </button>
          </div>
        </div>

        <div id="rental-app-content" className="bg-slate-50 dark:bg-slate-950 rounded-[3rem] p-4 sm:p-8 lg:p-12 mb-8 transition-colors duration-500">
          <header className="mb-16 text-center animate-fadeIn animation-delay-200">
            {isExporting && (
              <div className="mb-12 p-6 rounded-3xl border-2 border-emerald-600/20 inline-flex items-center gap-4 bg-white dark:bg-slate-900 mx-auto shadow-2xl">
                <Building className="text-emerald-600" size={32} />
                <div className="text-left leading-none">
                  <span className="text-xs font-black tracking-[0.3em] text-slate-400 block mb-1">BORJA FELIX ROJAS</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Auditoría del Escenario Propio</span>
                </div>
              </div>
            )}
            
            <div className="inline-flex bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 mb-10 scale-110">
              <TabButton active={activeTab === 'landlord'} onClick={() => setActiveTab('landlord')} icon={<Home size={18}/>} label="Arrendador" />
              <TabButton active={activeTab === 'tenant'} onClick={() => setActiveTab('tenant')} icon={<Users size={18}/>} label="Arrendatario" />
            </div>

            <h1 className="text-5xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-800 dark:from-white dark:via-emerald-400 dark:to-slate-300 tracking-tight leading-[0.9] uppercase pb-4">
              Control de <br/>
              <span className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm">Inversión</span>
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg sm:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
              Audita tu propia <span className="text-emerald-600 font-bold underline decoration-emerald-500/30 decoration-4 underline-offset-8">realidad financiera</span>. Del caos operativo a la rentabilidad medible.
            </p>
          </header>

          <main className="animate-fadeIn animation-delay-500">
            {activeTab === 'landlord' ? (
              <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* Dashboard de Resultados */}
                <div className="lg:col-span-12 grid md:grid-cols-3 gap-8 mb-8">
                   <div className="glass-card p-10 flex flex-col justify-between group overflow-hidden relative border-emerald-500/10 dark:border-emerald-500/20 bg-emerald-600/5">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <TrendingUp size={220} />
                      </div>
                      <div className="relative z-10">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-200 dark:border-emerald-800">Rendimiento Operativo</span>
                        <h2 className="text-3xl font-black mt-6 leading-tight dark:text-white uppercase tracking-tighter">Retorno <br/><span className="text-7xl text-emerald-600">ROE</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium leading-relaxed">Rentabilidad sobre el dinero real invertido de tu bolsillo cada año.</p>
                      </div>
                      <div className="mt-8 relative z-10 w-full">
                        <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-800 dark:text-white flex items-baseline gap-2 leading-tight">
                          {results.roe.toFixed(1)}<span className="text-2xl text-emerald-400 font-light tracking-normal italic ml-2">%</span>
                        </div>
                      </div>
                   </div>

                   <div className="glass-card p-10 flex flex-col justify-between group overflow-hidden relative border-blue-500/10 dark:border-blue-500/20 bg-blue-600/5">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                        <Euro size={220} />
                      </div>
                      <div className="relative z-10">
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-200 dark:border-blue-800">Flujo de Caja Anual</span>
                        <h2 className="text-3xl font-black mt-6 leading-tight dark:text-white uppercase tracking-tighter">Cash <br/><span className="text-7xl text-blue-600">Neto</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium leading-relaxed">Dinero que queda en tu cuenta tras pagar hipoteca, gastos e impuestos.</p>
                      </div>
                      <div className="mt-8 relative z-10 w-full">
                        <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-800 dark:text-white flex items-baseline gap-2 leading-tight">
                          {formatEuro(results.cashFlowAnual)}
                        </div>
                      </div>
                   </div>

                   {/* Yield Flow Meter (Linear "Thermometer" style) */}
                    <div className="glass-card p-10 flex flex-col justify-between h-full bg-white/50 dark:bg-slate-900/50 border-emerald-500/5">
                        <div className="mb-4">
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                <Target size={18} className="text-emerald-500" />
                                Monitor de Rendimiento Zen
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Distribución del Flujo de Caja Anual</p>
                        </div>
                        
                        <div className="space-y-8 py-4">
                           {chartData.map((d) => {
                             const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
                             const percentage = (d.value / total) * 100;
                             return (
                               <div key={d.name} className="space-y-3 group/meter">
                                  <div className="flex justify-between items-end">
                                     <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{d.name}</span>
                                     <span className="text-sm font-black dark:text-white">{formatEuro(d.value)}</span>
                                  </div>
                                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                                     <div 
                                      className="h-full rounded-full transition-all duration-1000 ease-out"
                                      style={{ 
                                        width: `${percentage}%`, 
                                        backgroundColor: d.color,
                                        boxShadow: `0 0 20px -5px ${d.color}`
                                      }}
                                     />
                                  </div>
                               </div>
                             );
                           })}
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <Info size={14} className="text-blue-500" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ratio de Capitalización</span>
                            </div>
                            <span className="text-xs font-black text-blue-500">{results.rentabilidadNeta.toFixed(1)}% Cap Rate</span>
                        </div>
                    </div>
                </div>

                {/* Métricas Avanzadas de Gestión (Fase 4) */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                   <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 border-emerald-500/10 dark:border-emerald-500/20 group hover:border-emerald-500/40 transition-colors shadow-none">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Ingreso Operativo (NOI)</p>
                      <div className="text-3xl font-black dark:text-white uppercase tracking-tighter">{formatEuro(results.noi)}</div>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Net Operating Income Anual</p>
                   </div>
                   <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 border-blue-500/10 dark:border-blue-500/20 group hover:border-blue-500/40 transition-colors shadow-none">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Punto de Recuperación</p>
                      <div className="text-3xl font-black dark:text-white uppercase tracking-tighter">{results.paybackYears === Infinity ? 'í¢Ë†Å¾' : results.paybackYears.toFixed(1)} <span className="text-sm font-light italic">años</span></div>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Tiempo recuperación equity</p>
                   </div>
                   <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 border-amber-500/10 dark:border-amber-500/20 group hover:border-amber-500/40 transition-colors shadow-none">
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Cash on Cash</p>
                      <div className="text-3xl font-black dark:text-white uppercase tracking-tighter">{results.roe.toFixed(1)}<span className="text-sm">%</span></div>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Rendimiento capital activo</p>
                   </div>
                   <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 border-purple-500/10 dark:border-purple-500/20 group hover:border-purple-500/40 transition-colors shadow-none">
                      <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">Escudo Fiscal</p>
                      <div className="text-3xl font-black dark:text-white uppercase tracking-tighter">{formatEuro(results.amortizacionInmueble + results.interesesDeduciblesAnuales)}</div>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Deducción Amort.+Intereses</p>
                   </div>
                </div>

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                   {/* Inputs Sections */}
                   <div className="space-y-6">
                      <InputSection 
                        title="Adquisición (CAPEX)" 
                        icon={<TrendingUp size={20}/>}
                        bg="bg-blue-500/5"
                        iconColor="text-blue-500"
                        defaultOpen={true}
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ZenInput label="Precio Compra" value={inputs.precioCompra} onChange={(v) => setInputs({...inputs, precioCompra: v})} />
                            <ZenInput label="ITP / IVA (%)" value={inputs.itpIva} onChange={(v) => setInputs({...inputs, itpIva: v})} step={1} />
                            <ZenInput label="Reforma / Mobiliario" value={inputs.reformaCoste + inputs.mobiliario} onChange={(v) => setInputs({...inputs, reformaCoste: v})} />
                            <ZenInput label="Gastos Escritura" value={inputs.gastosEscritura} onChange={(v) => setInputs({...inputs, gastosEscritura: v})} />
                         </div>
                      </InputSection>

                      <InputSection 
                        title="Ingresos Corrientes" 
                        icon={<Euro size={20}/>}
                        bg="bg-emerald-500/5"
                        iconColor="text-emerald-500"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ZenInput label="Renta Mensual" value={inputs.rentaMensual} onChange={(v) => setInputs({...inputs, rentaMensual: v})} />
                            <ZenInput label="Indice Estatal (Tope)" value={inputs.indiceReferencia || 0} onChange={(v) => setInputs({...inputs, indiceReferencia: v})} />
                            <div className="sm:col-span-2 flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                               <div>
                                  <p className="font-black text-xs uppercase tracking-widest dark:text-white">¿Zona Tensionada?</p>
                                  <p className="text-[10px] text-slate-400 mt-1">Afecta a prórrogas y topes de precios (Ley 2024)</p>
                               </div>
                               <button 
                                onClick={() => setInputs({...inputs, zonaTensionada: !inputs.zonaTensionada})}
                                className={cn(
                                  "w-16 h-8 rounded-full transition-all relative p-1",
                                  inputs.zonaTensionada ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                                )}
                               >
                                  <div className={cn(
                                    "w-6 h-6 bg-white rounded-full shadow-lg transition-transform",
                                    inputs.zonaTensionada ? "translate-x-8" : "translate-x-0"
                                  )} />
                               </button>
                            </div>
                         </div>
                      </InputSection>

                      <InputSection 
                        title="Gastos (OPEX) Anuales" 
                        icon={<ShieldCheck size={20}/>}
                        bg="bg-amber-500/5"
                        iconColor="text-amber-500"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                               <ZenInput label="IBI Anual" value={inputs.ibi} onChange={(v) => setInputs({...inputs, ibi: v})} />
                               <p className="text-[9px] text-slate-400 px-4 italic font-medium tracking-tight">Ref: ~0.4% - 1.1% valor catastral</p>
                            </div>
                            <div className="space-y-1">
                               <ZenInput label="Tasa Basuras" value={inputs.tasaBasuras} onChange={(v) => setInputs({...inputs, tasaBasuras: v})} />
                               <p className="text-[9px] text-slate-400 px-4 italic font-medium tracking-tight">Ref: ~60€ - 120€ anual</p>
                            </div>
                            <div className="space-y-1">
                               <ZenInput label="Comunidad Mansual" value={inputs.comunidad / 12} onChange={(v) => setInputs({...inputs, comunidad: v * 12})} step={5} />
                               <p className="text-[9px] text-slate-400 px-4 italic font-medium tracking-tight">Ref: {formatEuro(inputs.comunidad)} anual</p>
                            </div>
                             <ZenInput label="Seguro Hogar (Anual)" value={inputs.seguroHogar} onChange={(v) => setInputs({...inputs, seguroHogar: v})} />
                             <ZenInput label="Seguro Impago (Anual)" value={inputs.seguroImpago} onChange={(v) => setInputs({...inputs, seguroImpago: v})} />
                            <ZenInput label="Mantenimiento Est." value={inputs.mantenimientoEstimado} onChange={(v) => setInputs({...inputs, mantenimientoEstimado: v})} />
                         </div>
                      </InputSection>
                   </div>

                   <div className="space-y-6">
                      <InputSection 
                        title="Financiación Escalonada" 
                        icon={<Building size={20}/>}
                        bg="bg-indigo-500/5"
                        iconColor="text-indigo-500"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ZenInput label="LTV (% Financia)" value={inputs.ltv} onChange={(v) => setInputs({...inputs, ltv: v})} step={5} />
                            <ZenInput label="Interés (TIN %)" value={inputs.interes} onChange={(v) => setInputs({...inputs, interes: v})} step={0.1} />
                            <ZenInput label="Plazo (Años)" value={inputs.plazoAnios} onChange={(v) => setInputs({...inputs, plazoAnios: v})} step={1} />
                            <ZenInput label="Comisión Apertura" value={inputs.comisionApertura} onChange={(v) => setInputs({...inputs, comisionApertura: v})} />
                         </div>
                      </InputSection>

                      <InputSection 
                        title="Fiscalidad (Versión 2024)" 
                        icon={<Scale size={20}/>}
                        bg="bg-rose-500/5"
                        iconColor="text-rose-500"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ZenInput label="Tu IRPF Marginal (%)" value={inputs.irpfMarginal} onChange={(v) => setInputs({...inputs, irpfMarginal: v})} step={1} />
                            <div className="space-y-4">
                               <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Reducción Ley Vivienda</label>
                               <select 
                                 value={inputs.tipoReduccion}
                                 onChange={(e) => setInputs({...inputs, tipoReduccion: parseInt(e.target.value) as any})}
                                 className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl font-black text-sm outline-none shadow-sm focus:ring-2 focus:ring-rose-500/20"
                               >
                                  <option value={50}>50% - General</option>
                                  <option value={60}>60% - Rehabilitación</option>
                                  <option value={70}>70% - Jóvenes (18-35)</option>
                                  <option value={90}>90% - Bajada de Renta -5%</option>
                               </select>
                            </div>
                            <div className="sm:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                               <button 
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-600 transition-colors"
                               >
                                  {showAdvanced ? 'Cerrar Datos Catastrales' : 'Editar Datos Catastrales (Cálculo Amortización)'}
                               </button>
                               {showAdvanced && (
                                 <div className="grid grid-cols-2 gap-6 mt-6 animate-fadeIn">
                                    <ZenInput label="Valor Catastral Total" value={inputs.valorCatastralTotal} onChange={(v) => setInputs({...inputs, valorCatastralTotal: v})} />
                                    <ZenInput label="Suelo (%)" value={inputs.valorCatastralSueloPct} onChange={(v) => setInputs({...inputs, valorCatastralSueloPct: v})} step={1} />
                                 </div>
                               )}
                            </div>
                         </div>
                      </InputSection>
                   </div>
                </div>

                <div className="lg:col-span-12 mt-12">
                   <WhatIfPanel results={results} />
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 sm:p-20 overflow-hidden relative group animate-fadeIn">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Calculator size={320} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center gap-6 mb-16">
                      <div className="p-6 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-500/40">
                        <Users size={32} />
                      </div>
                      <h3 className="text-4xl sm:text-6xl font-black tracking-tighter dark:text-white uppercase italic">Derechos del <span className="text-emerald-600">Inquilino</span></h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16">
                       <div className="space-y-10">
                          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Bajo la nueva Ley de Vivienda, los derechos del arrendatario están blindados. Selecciona un escenario para auditar la viabilidad.
                          </p>
                          
                          <div className="flex flex-wrap gap-3">
                             {tenantScenarios.map(s => (
                               <button 
                                 key={s.name}
                                 onClick={() => setTenantScenario(s)}
                                 className={cn(
                                   "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                   tenantScenario.name === s.name 
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 -translate-y-1" 
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50"
                                 )}
                               >
                                 {s.name}
                               </button>
                             ))}
                          </div>

                          <div className="space-y-6 pt-4">
                             <CheckItem label="Cero Comisiones: La inmobiliaria SIEMPRE la paga el propietario (Art. 20.1 LAU)." />
                             <CheckItem label="Prórrogas Extraordinarias: Hasta 3 años en zonas tensionadas por vulnerabilidad." />
                             <CheckItem label="Tope de Subida: Limitado al 3% anual en 2024 y al nuevo índice AEAT en 2025." />
                             <CheckItem label="Garantías: El propietario no puede pedir más de 2 meses de fianza/garantía adicional." />
                          </div>
                       </div>

                       <div className="p-12 rounded-[3rem] bg-slate-950 text-white space-y-8 shadow-2xl relative overflow-hidden group/card shadow-emerald-900/40 border border-emerald-500/20 flex flex-col justify-center">
                          <div className="absolute -top-10 -right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-1000" />
                          <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Ratio de Esfuerzo: {tenantScenario.name}</p>
                            <div className="text-9xl font-black tracking-tighter text-white flex items-baseline gap-2 leading-none">
                               {((inputs.rentaMensual / tenantScenario.income) * 100).toFixed(0)}<span className="text-4xl font-light text-emerald-400 italic">%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-8">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Ingreso Neto</span>
                                <span>{formatEuro(tenantScenario.income)}</span>
                             </div>
                             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-1000", inputs.rentaMensual/tenantScenario.income > 0.3 ? "bg-rose-500" : "bg-emerald-500")}
                                  style={{ width: `${Math.min(100, (inputs.rentaMensual/tenantScenario.income)*100)}%` }}
                                />
                             </div>
                             <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                <span className={cn(
                                  "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                                  inputs.rentaMensual/tenantScenario.income > 0.3 ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"
                                )}>
                                  {inputs.rentaMensual/tenantScenario.income > 0.3 ? "í¢Å¡Â í¯Â¸  Exceso de Carga (>30%)" : "í¢Å“â€¦ Alquiler Saludable"}
                                </span>
                             </p>
                          </div>
                       </div>
                    </div>
                </div>
              </div>
            )}
          </main>
          
          <footer className="mt-24 py-16 text-center border-t border-slate-100 dark:border-slate-900">
             {isExporting && (
               <div className="mb-12">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Análisis Generado el {new Date().toLocaleDateString('es-ES')}</p>
                 <a 
                   href="https://borjafelixrojas.odoo.com/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-8 py-3 rounded-full border border-emerald-600/20 inline-block text-emerald-600 font-black text-sm tracking-tighter hover:bg-emerald-600/5 transition-colors"
                 >
                   BORJAFELIXROJAS.ODOO.COM
                 </a>
               </div>
             )}
             <p className="text-slate-300 dark:text-slate-700 text-[10px] tracking-[0.8em] font-black uppercase">
               ESTRATEGIA · TECNOLOGíA · DATOS · 2026
             </p>
          </footer>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
         <div className="glass-card p-12 border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Arquitectura del Proyecto <span className="text-emerald-500 font-light italic">Showcase</span></h3>
                  <div className="flex flex-wrap gap-3">
                     {['React 19', 'Vite', 'Tailwind v4', 'Lucide', 'html2canvas', 'Vibe Coding'].map(tech => (
                        <span key={ tech } className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">{tech}</span>
                     ))}
                  </div>
               </div>
               <div className="max-w-md text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed italic">
                  Este simulador ha sido concebido bajo la metodología de "Ingeniería de lo Cotidiano", priorizando la densidad de información y la agilidad de cálculo sobre la complejidad administrativa. Un motor Antigravity al servicio de la rentabilidad inmobiliaria.
               </div>
            </div>
         </div>
      </div>

      <div className="py-12 flex justify-center gap-6 animate-fadeIn">
          <a href="https://borjafelixrojas.odoo.com/" title="Compartir Simulación" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-emerald-500 hover:scale-110 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
            <Share2 size={24} />
          </a>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all focus:outline-none",
        active 
          ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-2xl scale-105" 
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function InputSection({ title, children, icon, bg, iconColor, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-xl shadow-slate-200/30 dark:shadow-none bg-white/50 dark:bg-slate-900/50", bg)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-900 transition-all focus:outline-none"
      >
        <div className="flex items-center gap-5">
          <div className={cn("p-5 rounded-3xl shadow-2xl transition-all group-hover:scale-110 group-hover:-rotate-6 bg-white dark:bg-slate-900", iconColor)}>
            {icon}
          </div>
          <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
        <ChevronDown className={cn("text-slate-300 transition-transform duration-700", isOpen && "rotate-180")} size={22} />
      </button>
      
      <div className={cn(
        "transition-all duration-700 ease-in-out px-10 pb-10",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
      )}>
        {children}
      </div>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 shadow-sm group hover:border-emerald-500/30 transition-colors">
      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
        <CheckCircle2 size={18} />
      </div>
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-tight">{label}</p>
    </div>
  );
}

function WhatIfPanel({ results }: { results: any }) {
  return (
    <div className="glass-card overflow-hidden bg-slate-900 text-white relative">
       <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <History size={240} />
       </div>
       <div className="p-10 sm:p-14 relative z-10">
          <div className="flex items-center gap-6 mb-12">
             <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">
                <Lightbulb size={24} />
             </div>
             <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase italic">Estrategias <span className="text-emerald-500">Optimización</span></h3>
                <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Maximiza tu rentabilidad fiscal y operativa</p>
             </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
             <ScenarioCard 
               title="Bajada de Renta -5%"
               impact="+22% Cash Flow"
               desc="Al bajar un 5% la renta en zona tensionada, activas la reducción del 90% en el IRPF (Ley 2024). El ahorro fiscal supera con creces la pérdida de ingreso bruto."
               result={formatEuro(results.cashFlowAnual * 1.22)}
             />
             <ScenarioCard 
               title="Inquilino Joven (18-35)"
               impact="+9% Neto"
               desc="Al alquilar a jóvenes en zonas tensionadas, la reducción fiscal sube al 70%. Ideal para maximizar el retorno neto sin bajar el precio de mercado."
               result={formatEuro(results.cashFlowAnual * 1.09)}
               variant="blue"
             />
          </div>
       </div>
    </div>
  );
}

function ScenarioCard({ title, impact, desc, result, variant = 'emerald' }: any) {
  return (
    <div className="space-y-6 group/scen">
       <div className="flex justify-between items-center">
          <h4 className="text-xl font-black uppercase tracking-tight">{title}</h4>
          <span className={cn(
            "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            variant === 'emerald' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
          )}>{impact}</span>
       </div>
       <p className="text-slate-400 text-xs leading-relaxed font-medium">{desc}</p>
       <div className="pt-6 border-t border-white/10">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Nuevo Flujo Neto Estimado</p>
          <div className="text-4xl font-black text-white group-hover/scen:translate-x-2 transition-transform">{result}</div>
       </div>
    </div>
  );
}
