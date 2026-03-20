export interface RentalInputs {
  // --- LOCALIZACIÓN ---
  municipio: string;
  barrio?: string;
  habitaciones?: number;
  // --- CAPEX (Adquisición) ---
  precioCompra: number;
  itpIva: number;
  gastosEscritura: number; // Notariado, Registro, Gestoría
  reformaCoste: number;
  mobiliario: number;

  // --- INCOME (Ingresos) ---
  rentaMensual: number;
  rentaAnterior?: number; // Relevante para zona tensionada
  indiceReferencia?: number; // Tope legal en zona tensionada
  zonaTensionada: boolean;
  tasaVacancia: number; // % anual

  // --- OPEX (Gastos Operativos Anuales) ---
  ibi: number;
  comunidad: number;
  seguroHogar: number;
  seguroImpago: number;
  mantenimientoEstimado: number;
  tasaBasuras: number;
  honorariosGestion?: number; // Si hay inmobiliaria gestionando

  // --- FINANCIACIÓN ---
  ltv: number; // % Financiación sobre precio de compra
  interes: number; // % TIN
  plazoAnios: number;
  comisionApertura: number;

  // --- FISCALIDAD (IRPF ESPAÑA) ---
  valorCatastralTotal: number;
  valorCatastralSueloPct: number; // Normalmente ~20-30%
  salarioBase: number; // Salario bruto del propietario para calcular tramo marginal
  autonomousRegion: 'madrid' | 'cataluna' | 'valencia' | 'andalucia' | 'otras';
  tipoReduccion: 50 | 60 | 70 | 90; // Ley Vivienda 2024
}

export interface RentalResults {
  inversionTotal: number;
  capitalPropio: number;
  financiacionTotal: number;
  cuotaHipotecariaMensual: number;
  
  ingresosBrutosAnuales: number;
  gastosOperativosAnuales: number;
  ebitda: number;
  
  amortizacionInmueble: number;
  interesesDeduciblesAnuales: number;
  rendimientoNetoFiscal: number;
  cuotaIrpfAnual: number;
  tipoIrpfEfectivo: number; // Tramo efectivo real calculado
  
  cashFlowAnual: number;
  rentabilidadBruta: number;
  rentabilidadNeta: number;
  roe: number; // Rentabilidad sobre capital propio
  noi: number;
  paybackYears: number;
}

export interface MortgageSchedule {
  year: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  annualPayment: number;
  endingBalance: number;
  remainingYears: number;
}

export function generateMortgageSchedule(principal: number, annualRate: number, years: number): MortgageSchedule[] {
  if (principal <= 0 || years <= 0) return [];
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  const monthlyPayment = r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
  
  const schedule: MortgageSchedule[] = [];
  let balance = principal;
  
  for (let y = 1; y <= years; y++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    const startBal = balance;
    
    for (let m = 1; m <= 12; m++) {
      const interestPayment = r > 0 ? balance * r : 0;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
    }
    
    schedule.push({
      year: y,
      startingBalance: startBal,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      annualPayment: yearInterest + yearPrincipal,
      endingBalance: Math.max(0, balance),
      remainingYears: years - y
    });
  }
  return schedule;
}

export interface YearProjection {
  year: number;
  cashFlowAnual: number;
  cashFlowAcumulado: number;
  equityConstruido: number;
  riquezaNetaGenerada: number;
  paybackAchieved: boolean;
}

export function calculateProjections(inputs: RentalInputs, results: RentalResults, yearsLimit: number = 30): YearProjection[] {
  const schedule = generateMortgageSchedule(results.financiacionTotal, inputs.interes, inputs.plazoAnios);
  
  const projections: YearProjection[] = [];
  let cumulativeCash = 0;
  const initialEquity = results.capitalPropio;

  for (let year = 1; year <= yearsLimit; year++) {
    const mortgageData = schedule.find(s => s.year === year) || { principalPaid: 0, interestPaid: 0, annualPayment: 0 };
    
    const inflationMultiplier = Math.pow(1.02, year - 1);
    const currentRenta = inputs.rentaMensual * 12 * (1 - inputs.tasaVacancia / 100) * inflationMultiplier;
    const currentOpex = results.gastosOperativosAnuales * inflationMultiplier;
    
    const ebitda = currentRenta - currentOpex;
    const baseAmortizada = results.amortizacionInmueble;
    const rendimientoFiscalAnual = currentRenta - currentOpex - mortgageData.interestPaid - baseAmortizada;
    const rendimientoReducido = Math.max(0, rendimientoFiscalAnual * (1 - inputs.tipoReduccion / 100));
    
    const irpfResult = calculateProgressiveIRPF(rendimientoReducido, inputs.autonomousRegion, inputs.salarioBase);
    
    const anioCashFlow = ebitda - mortgageData.annualPayment - irpfResult.totalTax;
    cumulativeCash += anioCashFlow;
    
    const totalPrincipalPaid = schedule.filter(s => s.year <= year).reduce((acc, curr) => acc + curr.principalPaid, 0);
    
    projections.push({
      year,
      cashFlowAnual: anioCashFlow,
      cashFlowAcumulado: cumulativeCash,
      equityConstruido: totalPrincipalPaid,
      riquezaNetaGenerada: cumulativeCash + totalPrincipalPaid,
      paybackAchieved: cumulativeCash >= initialEquity
    });
  }
  
  return projections;
}

import { calculateProgressiveIRPF } from './tax-tramos';

export function calculateRentalYield(inputs: RentalInputs): RentalResults {
  // 1. Inversión Inicial
  const gastosCompra = inputs.precioCompra * (inputs.itpIva / 100) + inputs.gastosEscritura;
  const inversionTotal = inputs.precioCompra + gastosCompra + inputs.reformaCoste + inputs.mobiliario;
  
  // 2. Hipoteca
  const capitalPrestado = inputs.precioCompra * (inputs.ltv / 100);
  const capitalPropio = inversionTotal - capitalPrestado + inputs.comisionApertura;
  
  let cuotaHipotecariaMensual = 0;
  let interesesAnualesFirstYear = 0;
  
  if (capitalPrestado > 0) {
    const r = (inputs.interes / 100) / 12;
    const n = inputs.plazoAnios * 12;
    if (r > 0) {
      cuotaHipotecariaMensual = (capitalPrestado * r) / (1 - Math.pow(1 + r, -n));
    } else {
      cuotaHipotecariaMensual = capitalPrestado / n;
    }
    interesesAnualesFirstYear = capitalPrestado * (inputs.interes / 100);
  }

  // 3. Flujo de Caja Operativo
  const ingresosBrutosAnuales = inputs.rentaMensual * 12 * (1 - inputs.tasaVacancia / 100);
  const gastosOperativosAnuales = 
    inputs.ibi + 
    inputs.comunidad + 
    inputs.seguroHogar + 
    inputs.seguroImpago + 
    inputs.mantenimientoEstimado + 
    inputs.tasaBasuras + 
    (inputs.honorariosGestion || 0);
    
  const ebitda = ingresosBrutosAnuales - gastosOperativosAnuales;

  // 4. Fiscalidad (IRPF)
  // Nota: Solo se amortiza la edificación (no el suelo). 3% anual.
  const valorEdificacionCatastral = inputs.valorCatastralTotal * (1 - inputs.valorCatastralSueloPct / 100);
  const ratioEdificacion = valorEdificacionCatastral / inputs.valorCatastralTotal;
  // La base de amortización es el mayor entre valor catastral edificación o coste compra edificación.
  const baseAmortizacion = (inputs.precioCompra + gastosCompra) * ratioEdificacion;
  const amortizacionInmueble = baseAmortizacion * 0.03;
  
  const interesesDeducibles = interesesAnualesFirstYear; 
  
  const rendimientoNetoFiscal = ingresosBrutosAnuales - gastosOperativosAnuales - interesesDeducibles - amortizacionInmueble;
  
  // Aplicar reducción Ley Vivienda (ej. 50% residencial habitual)
  const rendimientoReducido = Math.max(0, rendimientoNetoFiscal * (1 - inputs.tipoReduccion / 100));
  
  // Cálculo de IRPF con tramos reales
  const irpfResult = calculateProgressiveIRPF(rendimientoReducido, inputs.autonomousRegion, inputs.salarioBase);
  const cuotaIrpfAnual = irpfResult.totalTax;
  const tipoIrpfEfectivo = irpfResult.effectiveRate * 100;

  // 5. Cash Flow Final
  const cashFlowAnual = ebitda - (cuotaHipotecariaMensual * 12) - cuotaIrpfAnual;

  // 6. Rentabilidades
  const rentabilidadBruta = (ingresosBrutosAnuales / inversionTotal) * 100;
  const rentabilidadNeta = (ebitda / inversionTotal) * 100;
  const roe = (cashFlowAnual / capitalPropio) * 100;

  return {
    inversionTotal,
    capitalPropio,
    financiacionTotal: capitalPrestado,
    cuotaHipotecariaMensual,
    ingresosBrutosAnuales,
    gastosOperativosAnuales,
    ebitda,
    amortizacionInmueble,
    interesesDeduciblesAnuales: interesesDeducibles,
    rendimientoNetoFiscal,
    cuotaIrpfAnual,
    tipoIrpfEfectivo,
    cashFlowAnual,
    rentabilidadBruta,
    rentabilidadNeta,
    roe,
    noi: ebitda,
    paybackYears: cashFlowAnual > 0 ? capitalPropio / cashFlowAnual : Infinity
  };
}
