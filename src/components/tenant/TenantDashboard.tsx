import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calculator, Target, Check, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';
import { useAppStore } from '../../store/useAppStore';
import { evaluateTenantScenario } from '../../lib/tenant-engine';
import { supabase } from '../../lib/supabase';
import { AuditInput } from '../AuditInput';
import { cn, formatEuro, MetricTitle, InputSection, BooleanToggle } from '../ui';

export function TenantDashboard() {
  const { inputs, setInputs, updateInput } = useTenantStore();
  const { isExporting, feedbackGiven, setFeedbackGiven, isSubmittingFeedback, setIsSubmittingFeedback, activeTab } = useAppStore();
  const tenantResults = useMemo(() => evaluateTenantScenario(inputs), [inputs]);
  const isDark = document.documentElement.classList.contains('dark');

  const tenantGaugeData = [
    { name: 'Esfuerzo', value: tenantResults.ratioEsfuerzo, color: tenantResults.esFavorable ? '#10b981' : '#f43f5e' },
    { name: 'Libre', value: Math.max(0, 100 - tenantResults.ratioEsfuerzo), color: isDark ? '#1e293b' : '#f1f5f9' }
  ];

  const initialCashData = [
    { name: 'Primer Mes', value: inputs.rentaSolicitada, color: '#3b82f6' },
    { name: 'Fianza', value: inputs.rentaSolicitada * inputs.mesesFianza, color: '#10b981' },
    { name: 'Garantía Extra', value: inputs.rentaSolicitada * inputs.mesesGarantiaAdicional, color: '#f59e0b' },
    { name: 'Otros (Mudanza)', value: inputs.otrosGastosIniciales, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  const handleFeedbackSubmit = async (score: number) => {
    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('bfr_feedback_loop')
        .insert({
          tool_id: activeTab,
          feedback_score: score,
          precio_estimado_bfr: tenantResults.precioEstimadoMercado,
          inputs_json: inputs as any
        });
      if (error) console.warn("Supabase Warning:", error);
    } catch (err) {
      console.warn("Fetch Exception:", err);
    }
    setFeedbackGiven(true);
    setIsSubmittingFeedback(false);
  };

  return (
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

            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center bg-white/60 dark:bg-slate-950/40 p-4 rounded-xl border border-white/40 dark:border-slate-800/50 backdrop-blur-sm mb-3">
              <span>Tasación Modelo BFR:</span>
              <span className="text-lg font-black">{formatEuro(tenantResults.precioEstimadoMercado)}</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
              <span className="font-medium">Basado en dataset Idealista 2018 ajustado a 2025</span>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <InputSection title="Ficha Financiera y Contrato" icon={<Calculator size={20}/>} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AuditInput label="Ingreso Neto Mensual" prefix="€" value={inputs.ingresoNetoMensual} onChange={v => updateInput('ingresoNetoMensual', v)} tooltip="Suma solo ingresos fijos, recurrentes y comprobables por nómina."/>
              <AuditInput label="Renta Solicitada" prefix="€" value={inputs.rentaSolicitada} onChange={v => updateInput('rentaSolicitada', v)} tooltip="Canon mensual exigido por el propietario."/>
              <AuditInput label="Fianza de Ley (LAU)" suffix="mes/es" step={1} min={1} value={inputs.mesesFianza} onChange={v => updateInput('mesesFianza', v)} tooltip="Obligatorio por ley en España: 1 mes para vivienda habitual." />
              <AuditInput label="Garantía Adicional" suffix="mes/es" step={1} min={0} value={inputs.mesesGarantiaAdicional} onChange={v => updateInput('mesesGarantiaAdicional', v)} tooltip="El arrendador puede exigir hasta un máximo de 2 meses extra de aval o depósito."/>
              <div className="md:col-span-2">
                  <AuditInput label="Presupuesto de Adecuación (Mudanza y Altas)" prefix="€" value={inputs.otrosGastosIniciales} onChange={v => updateInput('otrosGastosIniciales', v)} tooltip="Dinero necesario para la mudanza, comprar mobiliario faltante o pagar altas de luz y agua si aplica." />
              </div>
            </div>
        </InputSection>

        <InputSection title="Perfil Estructural del Inmueble" icon={<Target size={20}/>} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Municipio</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.municipio} onChange={e => updateInput('municipio', e.target.value)} placeholder="Ej: Madrid, Barcelona..."
                  />
              </div>

              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Barrio</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.barrio || ''} onChange={e => updateInput('barrio', e.target.value)} placeholder="Ej: Eixample, Salamanca..."
                  />
              </div>

              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Micro-Zonificación</label>
                  <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.zona} onChange={e => updateInput('zona', e.target.value as any)}
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
                    value={inputs.estado} onChange={e => updateInput('estado', e.target.value as any)}
                  >
                    <option value="nuevo">Promoción Obra Nueva</option>
                    <option value="reformado">Reforma Integral Reciente</option>
                    <option value="bueno">Buen Estado de Conservación</option>
                    <option value="origen">De Origen / Requiere Mejoras</option>
                  </select>
              </div>

              <AuditInput label="Área Construida" suffix="m²" value={inputs.metrosCuadrados} onChange={v => updateInput('metrosCuadrados', v)} tooltip="Superficie comercial real con áreas comunes." />
              <AuditInput label="Nivel / Planta" step={1} min={0} value={inputs.planta || 1} onChange={v => updateInput('planta', v)} tooltip="Pisos bajos/sótanos disminuyen el valor de mercado." />
              <AuditInput label="Dormitorios" step={1} min={1} value={inputs.habitaciones} onChange={v => updateInput('habitaciones', v)} tooltip="Total de habitaciones dedicadas al descanso."/>
              <AuditInput label="Cuartos de Baño" step={1} min={1} value={inputs.banos} onChange={v => updateInput('banos', v)} tooltip="Incluye aseos de servicio básicos."/>
              
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <BooleanToggle label="Ascensor" checked={inputs.tieneAscensor} onChange={v => updateInput('tieneAscensor', v)} />
                  <BooleanToggle label="Pza. Parking" checked={inputs.tieneParking} onChange={v => updateInput('tieneParking', v)} />
                  <BooleanToggle label="Terraza/Exterior" checked={inputs.tieneTerraza} onChange={v => updateInput('tieneTerraza', v)} />
                  <BooleanToggle label="Climatización A/C" checked={inputs.tieneAireAcondicionado} onChange={v => updateInput('tieneAireAcondicionado', v)} />
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
  );
}
