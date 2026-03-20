import { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { TrendingUp, Euro, Building, ShieldCheck } from 'lucide-react';
import { useLandlordStore } from '../../store/useLandlordStore';
import { usePrecioVentaRef } from '../../hooks/useMercadoReference';
import { calculateRentalYield, calculateProjections } from '../../lib/rental-engine';
import { AuditInput } from '../AuditInput';
import { formatEuro, MetricTitle, InputSection, BooleanToggle } from '../ui';

function resultsToCapRate(noi: number, precioCompra: number) {
  if (precioCompra === 0) return 0;
  return ((noi / precioCompra) * 100).toFixed(1);
}

export function LandlordDashboard() {
  const { inputs, updateInput } = useLandlordStore();
  const landlordResults = useMemo(() => calculateRentalYield(inputs), [inputs]);
  const { data: refVenta } = usePrecioVentaRef(inputs.municipio, inputs.habitaciones, undefined, undefined, inputs.barrio);
  const isDark = document.documentElement.classList.contains('dark');

  const landlordExpensesData = [
    { name: 'Hipoteca', value: landlordResults.cuotaHipotecariaMensual * 12, color: '#3b82f6' },
    { name: 'Comunidad + IBI', value: inputs.comunidad + inputs.ibi, color: '#eab308' },
    { name: 'Seguros', value: inputs.seguroHogar + inputs.seguroImpago, color: '#f97316' },
    { name: 'Mantenimiento', value: inputs.mantenimientoEstimado, color: '#64748b' }
  ].filter(d => d.value > 0);

  const landlordProjectionData = useMemo(() => {
    return calculateProjections(inputs, landlordResults, Math.max(20, inputs.plazoAnios)).map(p => ({
      ...p,
      yearLabel: `Año ${p.year}`
    }));
  }, [inputs, landlordResults]);

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
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
        
        {/* Máquina de Riqueza / Payback Visual */}
        <div className="lg:col-span-2 md:col-span-2 min-h-[350px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
              <div className="max-w-[70%]">
                  <MetricTitle title="Máquina de Riqueza (Acumulada)" description="¿Por qué comprar ladrillo? Tu inquilino destruye tu deuda y el cash flow se acumula pagándote el capital aportado." />
                  <div className="flex flex-wrap gap-4 text-xs font-bold mt-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>Vivienda Pagada</div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>Cash Líquido</div>
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"><div className="w-3 h-1 rounded-sm bg-amber-500"></div>Riqueza Neta Total</div>
                  </div>
              </div>
              <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 px-2 py-1 rounded-md">META DE PAYBACK INICIAL</span>
                  <div className="text-2xl font-black text-rose-500 dark:text-rose-400 mt-2">{formatEuro(landlordResults.capitalPropio)}</div>
              </div>
            </div>
            
            <div className="relative h-56 mt-auto opacity-100 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={landlordProjectionData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatEuro(value), name === 'cashFlowAcumulado' ? 'Cash Líquido Ganado' : name === 'equityConstruido' ? 'Vivienda Pagada al Banco' : 'Riqueza Neta Absoluta']}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <ReferenceLine y={landlordResults.capitalPropio} stroke="#ef4444" strokeDasharray="4 4" opacity={0.5} />
                    
                    <Area type="monotone" dataKey="equityConstruido" stackId="1" stroke="#3b82f6" strokeWidth={2} fill="url(#colorEquity)" />
                    <Area type="monotone" dataKey="cashFlowAcumulado" stackId="1" stroke="#10b981" strokeWidth={2} fill="url(#colorCash)" />
                    {/* Rendered trailing so it's painted directly ON TOP of the others */}
                    <Area type="monotone" dataKey="riquezaNetaGenerada" stroke="#f59e0b" strokeWidth={3} fillOpacity={0} />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Tributación Realista (NUEVO) */}
        <div className="md:col-span-2 lg:col-span-4 min-h-[180px] p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 shadow-sm flex flex-col justify-between">
            <MetricTitle title="Análisis Fiscal: La Magia de la Amortización" description="Tus ingresos reducidos legalmente por gastos fantasma (Amortización Inmueble 3%)" />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Amortización (Gasto Contable)</div>
                    <div className="text-2xl font-black text-rose-500 dark:text-rose-400">-{formatEuro(landlordResults.amortizacionInmueble)}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Rendimiento Neto Fiscal</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatEuro(landlordResults.rendimientoNetoFiscal)}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Cuota IRPF Final a Pagar</div>
                    <div className="text-2xl font-black text-amber-500 dark:text-amber-400">-{formatEuro(landlordResults.cuotaIrpfAnual)}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Tipo IRPF Efectivo Real</div>
                    <div className="text-2xl font-black text-blue-500 dark:text-blue-400">{landlordResults.tipoIrpfEfectivo.toFixed(2)}%</div>
                </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium bg-white/60 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
               <span className="font-bold text-emerald-600 dark:text-emerald-400">¿Qué pasa aquí?</span> Hacienda te permite apuntar un {formatEuro(landlordResults.amortizacionInmueble)} de "desgaste" del piso como gasto. Es un gasto que jamás sale de tu cuenta bancaria, pero reduce radicalmente tu base imponible. Tras aplicar la reducción del {inputs.tipoReduccion}%, tu tipo efectivo real de IRPF sobre el beneficio es bajísimo.
            </p>
        </div>

        {/* NOI + Cap Rate Bruto */}
        <div className="md:col-span-1 lg:col-span-2 min-h-[220px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <MetricTitle title="Net Operating Income (NOI)" description="El corazón operativo del activo. Ingresos menos operativos, descarta tu deuda (hipoteca) para evidenciar su competitividad tasable." />
            <div className="text-4xl font-black text-slate-900 dark:text-white mt-auto mb-6">
              {formatEuro(landlordResults.noi)}
            </div>
            
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

      <div className="flex flex-col gap-8">
        <InputSection title="I. Localización (Mercado Real)" icon={<Building size={20}/>} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Municipio</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.municipio} onChange={e => updateInput('municipio', e.target.value)} placeholder="Ej: Barcelona"
                  />
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Barrio</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.barrio || ''} onChange={e => updateInput('barrio', e.target.value)} placeholder="Ej: Eixample"
                  />
              </div>
              <AuditInput label="Nº Habitaciones" step={1} min={1} value={inputs.habitaciones || 2} onChange={v => updateInput('habitaciones', v)} tooltip="Afecta a la comparativa de mercado."/>
            </div>
            
            {refVenta && (
              <div className="mt-6 text-sm font-bold text-slate-700 dark:text-slate-300 flex flex-col md:flex-row justify-between items-center bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/50 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                  <div className="flex flex-col relative z-10">
                    <span className="text-emerald-800 dark:text-emerald-300 mb-1">Mercado Venta Real ({refVenta.zona}):</span>
                    <span className="text-xs text-slate-500 font-medium tracking-wide">Basado en {refVenta.total_muestra} transacciones web analizadas</span>
                  </div>
                  <div className="flex gap-4 items-center relative z-10 mt-4 md:mt-0">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">P25 Barrio</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatEuro(refVenta.precio_p25)}</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 dark:bg-slate-900/50 px-4 py-2 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Mediana Mº</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{formatEuro(refVenta.precio_mediana)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">P75 Barrio</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatEuro(refVenta.precio_p75)}</span>
                    </div>
                  </div>
              </div>
            )}
        </InputSection>

        <InputSection title="II. Capital Expenditure (CAPEX)" icon={<TrendingUp size={20}/>} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AuditInput label="Valor Base Compra" prefix="€" value={inputs.precioCompra} onChange={v => updateInput('precioCompra', v)} tooltip="El valor crudo registrado en escrituras. Base del ITP."/>
              <AuditInput label="Trasmisiones/IVA" suffix="%" value={inputs.itpIva} onChange={v => updateInput('itpIva', v)} step={0.5} tooltip="El porcentaje del ITP local (o 10% IVA para Nueva Construcción)."/>
              <AuditInput label="Inversión Reforma" prefix="€" value={inputs.reformaCoste + inputs.mobiliario} onChange={v => updateInput('reformaCoste', v)} tooltip="Suma del dinero en equipamiento, lavado de cara o amoblado integral."/>
              <AuditInput label="Notaría y Extras" prefix="€" value={inputs.gastosEscritura} onChange={v => updateInput('gastosEscritura', v)} tooltip="Notario, Registro Público y posible tasadora asociada al proceso."/>
            </div>
        </InputSection>
        
        <InputSection title="III. Operativa Anual Bruta" icon={<Euro size={20} />} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AuditInput label="Aforo Renta Mensual" prefix="€" value={inputs.rentaMensual} onChange={v => updateInput('rentaMensual', v)} tooltip="Monto a solicitar en mercado." />
              <AuditInput label="Holgura / Vacancia" suffix="%" value={inputs.tasaVacancia} onChange={v => updateInput('tasaVacancia', v)} step={1} tooltip="Descuenta un margen anual de ingresos para prepararse contra meses nulos predecibles y cambio del inquilino." />
              
              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <BooleanToggle label="Activo Declarado en Zona Tensionada Estatal" checked={inputs.zonaTensionada} onChange={v => updateInput('zonaTensionada', v)} />
              </div>
              {inputs.zonaTensionada && (
                <div className="md:col-span-2 -mx-2 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all">
                    <AuditInput label="Renta del Contrato Antiguo" prefix="€" value={inputs.rentaAnterior || 0} onChange={v => updateInput('rentaAnterior', v)} tooltip="Clave legal (Ley 12/2023): Limita las pretensiones y bloquea al propietario de exigir más dinero percutiendo tu capacidad de Cap Rate, con excepciones tasadas por reforma."/>
                </div>
              )}
            </div>
        </InputSection>

        <InputSection title="IV. Modelo de Apalancamiento D/E" icon={<Building size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AuditInput label="Ratio Financiado (LTV)" suffix="%" value={inputs.ltv} onChange={v => updateInput('ltv', v)} step={5} tooltip="Porcentaje bancario inyectado por el prestamista (Ej: 80% lo fondea el banco, 20% es tu Equity inicial)." />
              <AuditInput label="TIN Ponderado" suffix="%" value={inputs.interes} onChange={v => updateInput('interes', v)} step={0.1} tooltip="Interés puro (TIN) del apalancamiento."/>
              <AuditInput label="Ciclo Amortiza." suffix="Años" value={inputs.plazoAnios} onChange={v => updateInput('plazoAnios', v)} step={1} tooltip="Horizonte temporal del préstamo concedido." />
              <AuditInput label="Costes Operación" prefix="€" value={inputs.comisionApertura} onChange={v => updateInput('comisionApertura', v)} tooltip="Costes explícitos por abrir dicho volumen de deuda." />
            </div>
        </InputSection>

        <InputSection title="V. Estructura Fija OPEX y FISCALIDAD" icon={<ShieldCheck size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AuditInput label="Comunidad/Seguridad" prefix="€" value={inputs.comunidad / 12} onChange={v => updateInput('comunidad', v * 12)} tooltip="Costo fijo comunal del inmueble anualizado para modelo." />
              <AuditInput label="Tributos Recurrentes" prefix="€" value={inputs.ibi} onChange={v => updateInput('ibi', v)} tooltip="Anualidad agregada de las obligaciones municipales y catastrales (IBI y Basuras locales)."/>
              <AuditInput label="Pólizas y Coberturas" prefix="€" value={inputs.seguroHogar + inputs.seguroImpago} onChange={v => updateInput('seguroHogar', v)} tooltip="Riesgos externalizados (AR / Seguro de alquiler, Responsabilidad Civil)." />
              <AuditInput label="Derramas Reservadas" prefix="€" value={inputs.mantenimientoEstimado} onChange={v => updateInput('mantenimientoEstimado', v)} tooltip="Presupuesto bloqueado anual para contingencias."/>
              <AuditInput label="Salario Bruto (Titular)" prefix="€" value={inputs.salarioBase} onChange={v => updateInput('salarioBase', v)} tooltip="Tu salario anual para calcular en qué tramo del IRPF caes. Afecta al tipo marginal."/>
              
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Comunidad Autónoma</label>
                  <select 
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.autonomousRegion}
                    onChange={(e) => updateInput('autonomousRegion', e.target.value as any)}
                  >
                    <option value="madrid">Comunidad de Madrid</option>
                    <option value="cataluna">Cataluña</option>
                    <option value="valencia">Comunidad Valenciana</option>
                    <option value="andalucia">Andalucía</option>
                    <option value="otras">Resto de España (Estatal)</option>
                  </select>
              </div>

              <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/50 mt-1 md:col-span-2 lg:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Escudo Fiscal Ley Vivienda</label>
                  <p className="text-[11px] text-slate-500 font-medium mb-1">Reducción aplicable sobre el RNF.</p>
                  <select 
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 font-bold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors shadow-sm"
                    value={inputs.tipoReduccion}
                    onChange={(e) => updateInput('tipoReduccion', parseInt(e.target.value) as any)}
                  >
                    <option value={50}>Deducción Ordinaria (50%)</option>
                    <option value={60}>Obras Mejora Eficiencia (60%)</option>
                    <option value={70}>Nuevo Régimen a Jóvenes (70%)</option>
                    <option value={90}>Zona Tensionada Renta Bajada -5% (90%)</option>
                  </select>
              </div>
            </div>
        </InputSection>
      </div>
    </div>
  );
}
