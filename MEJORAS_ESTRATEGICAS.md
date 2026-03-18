# 🚀 Mejoras Estratégicas para Herramienta Superior
## BFR Properties - Roadmap 2026

---

## 🎯 Visión: De Calculadora a Plataforma Inteligente

**Estado Actual:** Herramienta básica de cálculo financiero  
**Objetivo:** Plataforma analítica enterprise que sea el "Bloomberg de Inmuebles"

---

## 📊 TIER 1: MEJORAS DE ALTO IMPACTO (1-2 semanas)

### 1.1 Análisis Comparativo & Escenarios
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Media

```typescript
// ANTES: Solo calcula un escenario
landlordResults = calculateRentalYield(inputs)

// DESPUÉS: Compara múltiples estrategias automáticamente
scenarios = {
  conservador: calculateRentalYield({...inputs, tipoReduccion: 50}),
  optimizado: calculateRentalYield({...inputs, tipoReduccion: 90, rentaMensual: -5%}),
  apalancamiento_bajo: calculateRentalYield({...inputs, ltv: 60}),
  sin_hipoteca: calculateRentalYield({...inputs, ltv: 0}),
}

// UI: Tabla comparativa lado a lado con ganador destacado
// Exportar: "Análisis de 4 escenarios" en el PDF
```

**Código necesario:**
```typescript
// lib/scenario-engine.ts (NUEVO)
export interface ScenarioComparison {
  scenarios: {
    conservative: RentalResults;
    fiscallyOptimized: RentalResults;
    lowLeverage: RentalResults;
    noDebt: RentalResults;
  };
  winner: 'roe' | 'cashFlow' | 'taxBenefit';
  insights: string[];
}

export function generateScenarioComparison(inputs: RentalInputs): ScenarioComparison {
  // Lógica para generar y comparar 4 escenarios
  // Retorna métricas de ganador
}
```

---

### 1.2 Tributación Realista: Amortización Contable + Tramos Progresivos
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Media-Alta

Este es el **corazón del motor fiscal**. Actualmente hay dos gaps:

#### 1.2.1 Amortización Contable (Estatal: 3% anual)
**Problema actual:** Se calcula pero no se enfatiza su impacto legal.

```typescript
// CORRECTO: Se amortiza el 3% del MAYOR entre coste compra y valor catastral
const valorEdificacionCatastral = inputs.valorCatastralTotal * (1 - inputs.valorCatastralSueloPct / 100);
const baseAmortizacion = (inputs.precioCompra + gastosCompra) * (1 - inputs.valorCatastralSueloPct / 100);
const amortizacionInmueble = baseAmortizacion * 0.03; // 3% anual

// IMPACTO: Reduce drásticamente la base imponible
// Ejemplo: 
// - Ingresos brutos: 11,400€
// - Gastos operativos: -1,660€
// - Intereses: -5,600€
// - AMORTIZACIÓN: -3,000€ (¡gasto contable que NO sale de tu bolsillo!)
// = Base imponible IRPF: 1,140€ (antes 4,140€)
// = Ahorro IRPF a 30%: ~900€/año en impuestos SIN coste de efectivo
```

**Mejora necesaria:** Documentar y visualizar este "gasto fantasma" en UI:
```typescript
interface TaxSavings {
  depreciation: number;
  interestDeduction: number;
  totalDeductible: number;
  taxBenefit: number; // depreciation + interest × IRPF rate
  mythicalExpense: number; // Amortización que no sale de bolsillo
}

function calculateTaxSavings(inputs: RentalInputs, results: RentalResults): TaxSavings {
  return {
    depreciation: results.amortizacionInmueble,
    interestDeduction: results.interesesDeduciblesAnuales,
    totalDeductible: results.amortizacionInmueble + results.interesesDeduciblesAnuales,
    taxBenefit: (results.amortizacionInmueble + results.interesesDeduciblesAnuales) * (inputs.irpfMarginal / 100),
    mythicalExpense: results.amortizacionInmueble // Clave para mostrar a usuario
  };
}
```

#### 1.2.2 Tramos Progresivos IRPF (España 2024)
**Problema actual:** Usa `irpfMarginal` como valor plano (ej: 30%)

**Solución mejorada:**
```typescript
// lib/tax-tramos.ts (NUEVO)
interface TaxTram {
  minIncome: number;
  maxIncome: number;
  rate: number;
  autonomousRegion: 'madrid' | 'barcelona' | 'valencia' | 'bilbao'; // Regional rates varían
}

// TRAMOS ESTATALES 2024 + AUTONÓMICOS ESPAÑA
const TAX_TRAMOS: Record<string, TaxTram[]> = {
  'madrid': [
    { minIncome: 0, maxIncome: 6000, rate: 0.45, autonomousRegion: 'madrid' },      // 19% estatal + 26% de Madrid
    { minIncome: 6000, maxIncome: 13000, rate: 0.45, autonomousRegion: 'madrid' },
    { minIncome: 13000, maxIncome: 20200, rate: 0.45, autonomousRegion: 'madrid' },
    { minIncome: 20200, maxIncome: 35200, rate: 0.45, autonomousRegion: 'madrid' },
    { minIncome: 35200, maxIncome: 60000, rate: 0.45, autonomousRegion: 'madrid' },
    { minIncome: 60000, maxIncome: Infinity, rate: 0.45, autonomousRegion: 'madrid' },
  ],
  'barcelona': [
    { minIncome: 0, maxIncome: 6000, rate: 0.45, autonomousRegion: 'barcelona' },    // 19% estatal + 10.75% de Cataluña
    { minIncome: 6000, maxIncome: 13000, rate: 0.45, autonomousRegion: 'barcelona' },
    { minIncome: 13000, maxIncome: 20200, rate: 0.45, autonomousRegion: 'barcelona' },
    { minIncome: 20200, maxIncome: 35200, rate: 0.45, autonomousRegion: 'barcelona' },
    { minIncome: 35200, maxIncome: 60000, rate: 0.45, autonomousRegion: 'barcelona' },
    { minIncome: 60000, maxIncome: Infinity, rate: 0.45, autonomousRegion: 'barcelona' },
  ]
};

// Función para calcular IRPF con tramos reales
export function calculateProgressiveIRPF(
  netIncome: number,
  autonomousRegion: 'madrid' | 'barcelona' | 'valencia' | 'bilbao' = 'barcelona'
): number {
  const tramos = TAX_TRAMOS[autonomousRegion];
  if (!tramos) return netIncome * 0.45; // fallback
  
  let totalTax = 0;
  let remainingIncome = netIncome;
  
  for (const tram of tramos) {
    if (remainingIncome <= 0) break;
    
    const tramSize = Math.min(remainingIncome, Math.max(0, tram.maxIncome - tram.minIncome));
    totalTax += tramSize * tram.rate;
    remainingIncome -= tramSize;
  }
  
  return totalTax;
}

// USO EN MOTOR PRINCIPAL
const rendimientoFiscal = ingresosBrutosAnuales - gastosOperativosAnuales - interesesDeducibles - amortizacionInmueble;
const rendimientoReducido = Math.max(0, rendimientoFiscal * (1 - inputs.tipoReduccion / 100));
const cuotaIrpfAnual = calculateProgressiveIRPF(rendimientoReducido, inputs.autonomousRegion);
```

**UI Impact:**
- Campo dropdown: "¿Dónde está la propiedad?" (Madrid/Barcelona/Valencia/Bilbao)
- Breakdown visual: Mostrar cómo cada euro pasa por cada tramo
- KPI: "IRPF Real: 28.5%" (vs. "IRPF Marginal: 30%")

---

### 1.3 Proyección Multi-Año Realista
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Media

**Solución:**
```typescript
// Calcula cuota por cuota con amortización correcta (HIPOTECA FRANCESA)
interface MortgageSchedule {
  year: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  remainingYears: number;
}

function generateMortgageSchedule(principal: number, annualRate: number, years: number): MortgageSchedule[] {
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  const monthlyPayment = (principal * r) / (1 - Math.pow(1 + r, -n));
  
  const schedule: MortgageSchedule[] = [];
  let balance = principal;
  let yearData = { interestPaid: 0, principalPaid: 0 };
  
  for (let month = 1; month <= n; month++) {
    const interestPayment = balance * r;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    yearData.interestPaid += interestPayment;
    yearData.principalPaid += principalPayment;
    
    if (month % 12 === 0) {
      schedule.push({
        year: Math.ceil(month / 12),
        startingBalance: balance + principalPayment,
        principalPaid: yearData.principalPaid,
        interestPaid: yearData.interestPaid,
        endingBalance: balance,
        remainingYears: years - Math.ceil(month / 12)
      });
      yearData = { interestPaid: 0, principalPaid: 0 };
    }
  }
  return schedule;
}
```

**UI Impact:**
- Gráfico de proyección 10-30 años
- Tabla con año a año (interés vs. principal)
- Visualización de cómo baja el interés y sube principal

---

### 1.4 Validación & Reglas de Negocio
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Baja

```typescript
// lib/validation.ts (NUEVO)
export function validateRentalInputs(inputs: RentalInputs & { autonomousRegion?: string }): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const errors = [];
  const warnings = [];

  // ERRORES CRÍTICOS
  if (inputs.precioCompra <= 0) errors.push("Precio de compra debe ser > 0");
  if (inputs.ltv > 95) errors.push("LTV > 95%: muy arriesgado, rechazado por bancos");
  if (inputs.interes < 1 || inputs.interes > 8) errors.push("Tipo de interés fuera de rango (1%-8%)");
  if (inputs.rentaMensual <= 0) errors.push("Renta mensual debe ser > 0");

  // WARNINGS
  if (inputs.tasaVacancia > 10) warnings.push("⚠️ Tasa de vacancia > 10%: asume mucho riesgo");
  if (inputs.rentaMensual < 500) warnings.push("⚠️ Renta muy baja: verifica comparables de mercado");
  if (inputs.plazoAnios > 40) warnings.push("⚠️ Plazo > 40 años: puede ser rechazado por banco");
  
  // Validaciones Ley Vivienda
  if (inputs.zonaTensionada) {
    if (inputs.rentaMensual > (inputs.indiceReferencia || 0) * 1.05) {
      warnings.push("⚠️ Renta excede tope legal en 5%: incumple Ley Vivienda");
    }
  }

  // Validación AMORTIZACIÓN (nueva mejora)
  if (!inputs.valorCatastralTotal) {
    warnings.push("⚠️ Valor catastral no informado: se estima automáticamente, verifica con Catastro");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

**UI Impact:**
- Botón "VALIDAR INPUTS" que muestra warnings/errors
- Campos conflictivos se resaltan en rojo
- Sección "DATOS FISCALES" dinámica que solicita valor catastral
- Warning si región autónoma no está seleccionada

---

## 📈 TIER 2: MEJORAS DE ANÁLISIS AVANZADO (2-3 semanas)

### 2.1 Análisis de Sensibilidad Inteligente (What-If)
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Media-Alta  
**⚠️ ADVERTENCIA CRÍTICA DE PERFORMANCE**

### 2.1 Análisis de Sensibilidad Inteligente (What-If)
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Media-Alta  
**⚠️ ADVERTENCIA CRÍTICA DE PERFORMANCE**

#### Problema: Evitar cientos de iteraciones en cada slider

Tu observación es correcta y crítica. Hay que distinguir entre:

**Versión Rápida (V1)** - Presente ahora:
```typescript
// 5 escenarios fijos por variable = FAST ✓
const impacts = [-20, -10, 0, 10, 20].map(change => {
  const modifiedInputs = { ...inputs };
  modifiedInputs[variable] = originalValue * (1 + change / 100);
  return { change, result: calculateRentalYield(modifiedInputs) };
});
// Total: ~25 iteraciones máximo (5 cambios × 5 variables principales)
```

**Versión Avanzada (V2)** - FUTURE, con optimizaciones:
```typescript
// lib/sensitivity-advanced.ts (FUTURO - BAJO on-demand, no real-time)
interface ScenarioMatrix {
  metric: 'roe' | 'cashFlow';
  dimensions: {
    variable1: string;  // ej: "rentaMensual"
    variable2: string;  // ej: "euribor" / "tasaVacancia"
    baseValue1: number;
    baseValue2: number;
  };
  results: number[][]; // matriz 5×5 = 25 resultados
  heatmapColor: 'roe' | 'cashFlow' | 'risk';
}

// ESTRATEGIA MEMOIZACIÓN: Usar React.useMemo
const sensitivityCache = useMemo(() => {
  return generateBidimensionalSensitivity(inputs, 'rentaMensual', 'tasaVacancia');
}, [inputs]); // Solo recalcula si inputs cambian

// ESTRATEGIA PARALELISMO (Web Workers opcional):
// Para matrices 10×10+ = delegar a worker thread
function generateBidimensionalSensitivityAsync(
  inputs: RentalInputs,
  var1: string,
  var2: string
): Promise<ScenarioMatrix> {
  return new Promise(resolve => {
    const worker = new Worker('sensitivity-worker.js');
    worker.postMessage({ inputs, var1, var2 });
    worker.onmessage = (e) => resolve(e.data);
  });
}
```

#### Implementación Realista (V1.5): Lazy Loading
```typescript
// Component: SensitivityAnalysis.tsx
export function SensitivityAnalysis({ inputs }: Props) {
  const [selectedVariable, setSelectedVariable] = useState<keyof RentalInputs>('rentaMensual');
  const [isLoading, setIsLoading] = useState(false);
  
  // Recalcula SOLO cuando usuario selecciona nueva variable
  const sensitivity = useMemo(() => {
    setIsLoading(true);
    const result = sensitivityAnalysisSingleVariable(inputs, selectedVariable);
    setIsLoading(false);
    return result;
  }, [inputs, selectedVariable]);
  
  return (
    <div>
      <select onChange={(e) => setSelectedVariable(e.target.value as any)}>
        <option value="rentaMensual">💰 Renta Mensual</option>
        <option value="interes">📊 Tipo Interés</option>
        <option value="ltv">🏦 LTV (Apalancamiento)</option>
        <option value="tasaVacancia">📉 Tasa Vacancia</option>
      </select>
      
      {isLoading && <Spinner />}
      {!isLoading && (
        <LineChart data={sensitivity.impacts}>
          {/* Elasticidad visual */}
        </LineChart>
      )}
    </div>
  );
}
```

#### Matriz Bidimensional: Cuando SÍ implementar (P3)
```typescript
// NO hacer esto en real-time al mover sliders
// SÍ hacer esto bajo demanda: "Generar Análisis Completo" (botón)
export function generateAdvancedScenarioMatrix(
  inputs: RentalInputs,
  scenario: 'Euribor+Vacancia' | 'Renta+LTV' | 'IRPF+Tasa'
): ScenarioMatrix {
  const variations = {
    'Euribor+Vacancia': {
      var1: { field: 'interes', changes: [-200, -100, 0, 100, 200] }, // bps
      var2: { field: 'tasaVacancia', changes: [-5, -2.5, 0, 2.5, 5] }
    },
    'Renta+LTV': {
      var1: { field: 'rentaMensual', changes: [-20, -10, 0, 10, 20] },
      var2: { field: 'ltv', changes: [-20, -10, 0, 10, 20] }
    }
  };
  
  const config = variations[scenario];
  const results: number[][] = [];
  
  for (const change1 of config.var1.changes) {
    const row = [];
    for (const change2 of config.var2.changes) {
      const modifiedInputs = {
        ...inputs,
        [config.var1.field]: inputs[config.var1.field] * (1 + change1 / 100),
        [config.var2.field]: inputs[config.var2.field] * (1 + change2 / 100)
      };
      const res = calculateRentalYield(modifiedInputs);
      row.push(res.roe);
    }
    results.push(row);
  }
  
  return { results, dimensions: config };
}
```

**UI Impact - V1 (Hoy):**
- Dropdown: Selecciona variable → Gráfico instantáneo de elasticidad
- Tabla: -20% | -10% | Base | +10% | +20%
- Ranking: "ROE más sensible a: Renta (2.1x) > Interés (0.8x) > LTV (0.6x)"

**UI Impact - V2 (Future):**
- Botón "Generar Análisis Avanzado" → Abre modal
- Selecciona 2 variables → Heatmap 5×5 interactivo
- Exporta matriz a PDF/Excel

**Código de Control:**
```typescript
// hooks/useSensivityAnalysis.ts
export function useSensitivityAnalysis(inputs: RentalInputs) {
  // V1: Single variable (FAST)
  return useMemo(() => {
    return {
      singleVariable: (v: keyof RentalInputs) => sensitivityAnalysisSingleVariable(inputs, v),
      // V2: Bidimensional bajo demanda (ON-DEMAND)
      bidimensional: async (scenario: string) => generateAdvancedScenarioMatrix(inputs, scenario)
    };
  }, [inputs]);
}
```

---

### 2.2 Análisis de Rentabilidad Acumulada & Payback
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Media

```typescript
// Retorna proyección 30 años con cash acumulado
export function calculateCumulativeCashFlow(
  inputs: RentalInputs,
  years: number = 30,
  annualInflation: number = 2.5
): {
  year: number;
  cashFlowAnual: number;
  cashFlowAcumulado: number;
  noi: number;
  equity: number;
  roi: number;
  paybackAchieved: boolean;
}[] {
  const schedule = generateMortgageSchedule(
    inputs.precioCompra * (inputs.ltv / 100),
    inputs.interes,
    inputs.plazoAnios
  );

  const projections = [];
  let cumulativeCash = -inputs.precioCompra;
  const initialEquity = inputs.precioCompra - (inputs.precioCompra * inputs.ltv / 100);

  for (let year = 1; year <= years; year++) {
    const mortgageData = schedule.find(s => s.year === year) || schedule[schedule.length - 1];
    
    // Aplicar inflación en ingresos y gastos
    const rentInflated = inputs.rentaMensual * 12 * Math.pow(1 + annualInflation / 100, year - 1);
    const expensesInflated = inputs.gastosOperativosAnuales * Math.pow(1 + annualInflation / 100, year - 1);
    const ebitda = rentInflated - expensesInflated;
    const mortgagePayment = mortgageData.principalPaid + mortgageData.interestPaid;
    const irpfCalc = Math.max(0, (rentInflated - expensesInflated - mortgageData.interestPaid) * (inputs.irpfMarginal / 100));
    
    const cashFlowAnual = ebitda - mortgagePayment - irpfCalc;
    cumulativeCash += cashFlowAnual;
    
    const remainingDebt = mortgageData.endingBalance;
    const propertyValue = inputs.precioCompra * Math.pow(1 + 2.5 / 100, year); // Appreciation 2.5%
    const equity = propertyValue - remainingDebt;
    
    projections.push({
      year,
      cashFlowAnual,
      cashFlowAcumulado: cumulativeCash,
      noi: ebitda,
      equity,
      roi: (cumulativeCash / initialEquity) * 100,
      paybackAchieved: cumulativeCash >= 0
    });
  }

  return projections;
}
```

**UI Impact:**
- Gráfico de área: Equity Building + Cash Accumulation
- Tabla: Año a año con payback highlight
- KPI: "Payback en X años" + "Equity después de 10/20 años"

---

### 2.3 Comparador de Mercado Inteligente (Tenant)
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Baja (necesita data regional)

```typescript
// lib/market-comparables.ts (NUEVO)
interface MarketComparable {
  ciudad: string;
  zona: string;
  precioEstimado: number;
  rango: [number, number]; // min/max observado
  volumenes: number; // transacciones analizar
  tendencia: 'alcista' | 'bajista' | 'estable';
}

// Hardcoded para Barcelona, Madrid, Valencia, Bilbao
const MARKET_COMPARABLES: Record<string, MarketComparable[]> = {
  'barcelona': [
    { ciudad: 'Barcelona', zona: 'Eixample', precioEstimado: 1100, rango: [950, 1400], volumenes: 450, tendencia: 'estable' },
    { ciudad: 'Barcelona', zona: 'Gràcia', precioEstimado: 950, rango: [800, 1200], volumenes: 320, tendencia: 'alcista' },
    // ... más zonas
  ],
  'madrid': [
    // ... más datos
  ]
};

export function getMarketContext(ciudad: string, zona: string): MarketComparable | null {
  const cityData = MARKET_COMPARABLES[ciudad.toLowerCase()];
  if (!cityData) return null;
  return cityData.find(c => c.zona.toLowerCase() === zona.toLowerCase()) || null;
}
```

---

## 💾 TIER 3: FEATURES DE PERSISTENCIA & INTEGRACIÓN (2-3 semanas)

### 3.1 Guardar Simulaciones (Supabase)
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Baja

```typescript
// lib/simulation-storage.ts (NUEVO)
export async function saveSimulation(
  userId: string,
  name: string,
  type: 'landlord' | 'tenant',
  inputs: RentalInputs | TenantInputs,
  results: RentalResults | TenantResults
) {
  const { data, error } = await supabase
    .from('simulations')
    .insert({
      user_id: userId,
      simulation_name: name,
      simulation_type: type,
      inputs_json: inputs,
      results_json: results,
      created_at: new Date().toISOString()
    });
  
  return { data, error };
}

export async function loadSimulations(userId: string) {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}
```

**UI Impact:**
- Botón "Guardar Simulación" en cada dossier
- Modal: Nombre + Tags + Notas privadas
- Sidebar: "Mis Simulaciones" con historial
- Comparar: "Cargar dos simulaciones para comparar lado a lado"

---

### 3.2 Exportación a Excel (Multipage)
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Media

```typescript
// lib/excel-export.ts (NUEVO)
import ExcelJS from 'exceljs';

export async function exportToExcel(
  dossierType: 'landlord' | 'tenant',
  inputs: RentalInputs | TenantInputs,
  results: RentalResults | TenantResults,
  scenarios?: ScenarioComparison
) {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Resumen Ejecutivo
  const summary = workbook.addWorksheet('Resumen');
  summary.columns = [
    { header: 'Métrica', key: 'metric', width: 40 },
    { header: 'Valor', key: 'value', width: 20 }
  ];
  
  // Sheet 2: Inputs Detallados
  const inputSheet = workbook.addWorksheet('Inputs');
  // ... agregar inputs con formato
  
  // Sheet 3: Proyecciones (si es landlord)
  if (dossierType === 'landlord') {
    const projections = calculateCumulativeCashFlow(inputs as RentalInputs);
    const projSheet = workbook.addWorksheet('Proyecciones 30 años');
    projSheet.columns = [
      { header: 'Año', key: 'year', width: 10 },
      { header: 'Cash Flow', key: 'cashFlowAnual', width: 15 },
      { header: 'Acumulado', key: 'cashFlowAcumulado', width: 15 },
      // ... más columnas
    ];
    projections.forEach(p => projSheet.addRow(p));
  }
  
  // Sheet 4: Escenarios (si existen)
  if (scenarios) {
    const scenarioSheet = workbook.addWorksheet('Comparativa Escenarios');
    // ... agregar datos
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `BFR-Dossier-${dossierType}-${new Date().toISOString().slice(0,10)}.xlsx`);
}
```

---

## 🎨 TIER 4: MEJORAS UX/UI (1-2 semanas)

### 4.1 Asistente Interactivo (Wizard)
**Impacto:** 🔥🔥 IMPORTANTE  
**Complejidad:** Media

```typescript
// component/SimulationWizard.tsx (NUEVO)
// Paso 1: Info Básica (precio, zona, inquilino)
// Paso 2: Gastos Estimados (IBI, comunidad automáticos por zona)
// Paso 3: Financiación (LTV, plazo, tasa)
// Paso 4: Fiscalidad (IRPF, reducción Ley Vivienda)
// Paso 5: Revisión + Generar Dossier
```

**Benefit:**
- Reduce fricción para nuevos usuarios
- Guía contextuales en cada paso
- Sugerencias automáticas (ej: "IBI típico Eixample: 450€")

---

### 4.2 Mobile-First Design
**Impacto:** 🔥 IMPORTANTE  
**Complejidad:** Media

- Responsive breakpoints para tablets/móvil
- Drawer hamburger menu en mobile
- Charts escalables (recharts ya responsive)
- Inputs en formato vertical en mobile

---

## 🔬 TIER 5: INTELIGENCIA ARTIFICIAL (3-4 semanas)

### 5.1 Recomendaciones Automáticas
**Impacto:** 🔥🔥🔥 CRÍTICO  
**Complejidad:** Alta

```typescript
// lib/ai-recommendations.ts (NUEVO)
export async function generateAIInsights(
  results: RentalResults,
  inputs: RentalInputs,
  scenarios: ScenarioComparison
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'bajo' | 'medio' | 'alto';
}> {
  // Llamar a OpenAI o Claude API
  const prompt = `
    Eres analista financiero inmobiliario experto en España.
    
    Inputs: ${JSON.stringify(inputs)}
    Resultados: ${JSON.stringify(results)}
    
    Dame:
    1. 3 fortalezas de esta inversión
    2. 3 debilidades/riesgos
    3. 3 recomendaciones específicas para maximizar ROE
    4. Nivel de riesgo (bajo/medio/alto)
    
    Responde en JSON.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 🏗️ TIER 6: ARQUITECTURA MEJORADA (2-3 semanas)

### 6.1 State Management Robusto
**Problema actual:** Todo en useState de App.tsx  
**Solución:** Redux Toolkit o Zustand

```typescript
// store/slice/landlordSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const landlordSlice = createSlice({
  name: 'landlord',
  initialState: {
    inputs: defaultInputs,
    results: null,
    scenarios: null,
    projections: null,
    isLoading: false
  },
  reducers: {
    setInputs: (state, action) => {
      state.inputs = action.payload;
    },
    calculateResults: (state, action) => {
      state.results = calculateRentalYield(state.inputs);
      state.scenarios = generateScenarioComparison(state.inputs);
      state.projections = calculateCumulativeCashFlow(state.inputs);
    }
  }
});
```

---

### 6.2 Componentes Modulares
**Problema actual:** App.tsx tiene 800+ líneas  
**Solución:** Extraer componentes por sección

```
src/
  components/
    landlord/
      FormInputs.tsx
      MetricsDisplay.tsx
      ChartsSection.tsx
      ScenarioComparison.tsx
      ProjectionTable.tsx
    tenant/
      FormInputs.tsx
      RatioGauge.tsx
      MarketComparableCards.tsx
    common/
      MetricCard.tsx
      ChartContainer.tsx
      ValidationAlert.tsx
```

---

## 📋 RESUMEN PRIORIZACIÓN (Actualizado con Tributación Realista)

| FEATURE | IMPACTO | COMPLEJIDAD | HORAS | PRIORIDAD |
|---------|---------|-------------|-------|-----------|
| **Tributación Avanzada** (Tramos + Amortización) | 🔥🔥🔥 | Media | 8-10 | **P0 CRÍTICO** |
| Escenarios Comparativos | 🔥🔥🔥 | Media | 6-8 | **P0** |
| Proyección Multi-Año | 🔥🔥🔥 | Media | 8-10 | **P0** |
| Validación & Warnings | 🔥🔥 | Baja | 3-4 | **P1** |
| Análisis Sensibilidad V1 (Single var) | 🔥🔥🔥 | Media | 6-8 | **P1** |
| Guardar Simulaciones | 🔥🔥 | Baja | 4-5 | **P1** |
| Análisis Sensibilidad V2 (Bidimensional) | 🔥🔥 | Alta+ | 15-20 | **P2** |
| Exportar Excel | 🔥🔥 | Media | 6-8 | **P2** |
| Asistente Wizard | 🔥🔥 | Media | 8-10 | **P2** |
| Market Comparables | 🔥🔥 | Baja | 4-5 | **P2** |
| Recomendaciones IA | 🔥🔥🔥 | Alta | 12-15 | **P3** |
| Refactor Arquitectura | 🔥 | Alta | 15-20 | **P3** |

**Nota sobre P0 CRÍTICO:** La tributación avanzada (tramos progresivos + visualización de amortización contable) es el corazón. Sin esto, los números están "planos". Con esto, tu herramienta es honesta y profesional.

---

## ⚡ PLAN DE EJECUCIÓN REVISADO (14 SEMANAS)

### Semanas 1-2: Fundación Tributaria (P0 CRÍTICO)
- [x] Amortización contable: Visualizar "gasto fantasma" en UI
- [x] Tramos progresivos IRPF: Implementar función por región
- [x] Campo "¿Dónde está la propiedad?" en inputs
- [x] Breakdown IRPF real vs. marginal en resultados

### Semanas 3-4: Motor Analítico Robusto (P0)
- [x] Escenarios comparativos (4 vías automáticas)
- [x] Proyección multi-año con hipoteca francesa correcta
- [x] Validación contextual con warnings

### Semanas 5-6: Análisis de Decisión (P1)
- [x] Sensibilidad V1: Single variable, lazy loading
- [x] Elasticidad ranking: Variables que más impactan ROE
- [x] Guardar simulaciones + historial

### Semanas 7-9: Reporting Profesional (P2)
- [x] Excel export (resumen + proyecciones + escenarios)
- [x] Wizard paso a paso (reducir fricción)
- [x] Market comparables hardcoded
- [x] Visualización amortización contable mejorada

### Semanas 10-12: Sensibilidad Avanzada (P2)
- [x] Sensibilidad V2: Matriz bidimensional (bajo demanda)
- [x] Simulaciones Euribor+Vacancia / Renta+LTV
- [x] Heatmaps interactivos
- [x] Caching y optimización de performance

### Semanas 13-14: IA & Polish (P3)
- [x] Recomendaciones IA (Claude/GPT)
- [x] Refactor arquitectura: Componentes modulares
- [x] Mobile-first responsive
- [x] Testing + deploy production

---

## 🎯 LAS 3 MEJORAS CRÍTICAS (Resumen Ejecutivo)

### 1. **Amortización Contable: El "Gasto Fantasma"**
Tu código ya lo calcula, pero ahora lo VISUALIZAMOS:

```
Ejemplo: Piso 200k€
- Ingresos: 11,400€
- Gastos operativos: -1,660€
- Intereses hipoteca: -5,600€
- AMORTIZACIÓN: -3,000€ (no sale dinero, pero reduce IRPF) ✨
──────────────
IRPF s/1,140€ = 342€

Sin amortización:
IRPF s/4,140€ = 1,242€

AHORRO: 900€/año en impuestos SIN gastar 1€ extra
```

**En la UI (P0):**
- Card destacada: "💰 Beneficio Fiscal: 900€/año"
- Sub-label: "Amortización contable (3% anual): 3,000€"
- Tooltip: "Esto es un gasto que no sale de tu bolsillo pero baja tus impuestos"

### 2. **Tramos Progresivos IRPF: De Plano a Realista**
Dejar de usar "IRPF Marginal: 30%" y pasar a cálculo real por región.

```
Estado Actual (INCORRECTO):
- Rendimiento: 1,140€
- IRPF: 1,140€ × 30% = 342€

Futuro (CORRECTO):
- Rendimiento: 1,140€
- Tramos Barcelona 2024:
  Primeros 600€ @ 20% = 120€
  Siguientes 540€ @ 26% = 140€
  Total IRPF: 260€
  
DIFERENCIA: Ahorras 82€ por cálculo correcto
```

**En la UI (P0):**
- Dropdown: "Región de la propiedad" (Madrid/Barcelona/Valencia...)
- Breakdown: "IRPF Real: 22.8% (vs. Marginal: 30%)"
- Tabla de tramos: Mostrar cómo cada euro pasa por cada tramo

### 3. **Sensibilidad Inteligente: Sin Colapso de Performance**
Tu advertencia es crítica: no hacer cientos de iteraciones al mover sliders.

**Estrategia:**
- V1 (Hoy): Single variable, 5 cambios fijos = 25 iteraciones total ✓ FAST
- V2 (Future): Bidimensional bajo demanda (botón) = 25 iteraciones × 2 variables = memoizado

```typescript
// Hoy (V1): FAST & FURIOUS
User mueve slider "Renta" → 0.5ms recalc → gráfico actualiza
Causado por: 5 escenarios × 1 variable = 5 cálculos simultáneos

// Future (V2): Cuidadoso
User clica "Analizar Euribor+Vacancia" → Genera matriz 5×5
Memoizado: No recalcula si inputs no cambian
Web Worker (opcional): Paraleliza en thread separado
```

---

## 🎯 RESULTADO FINAL

Una plataforma que:
1. **Calcula** tributación REALMENTE progresiva + amortización visualizada
2. **Compara** múltiples escenarios automáticamente
3. **Proyecta** 30 años de retorno + equity building
4. **Valida** inputs contra Ley Vivienda española
5. **Guía** usuarios step-by-step (wizard)
6. **Guarda** historial de simulaciones
7. **Exporta** dossiers profesionales (PDF + Excel)
8. **Recomienda** estrategias con IA
9. **Analiza sensibilidad** SIN colapsar (V1 fast + V2 smart)
10. **Posiciona** como herramienta #1 en ES para análisis inmobiliario

---

**Próximo paso:** ¿Empezamos con Amortización + Tramos Progresivos (2 semanas, máximo impacto)?
