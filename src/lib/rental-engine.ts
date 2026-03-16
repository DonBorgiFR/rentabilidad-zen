export interface RentalInputs {
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
  irpfMarginal: number; // Tramo marginal del propietario
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
  
  cashFlowAnual: number;
  rentabilidadBruta: number;
  rentabilidadNeta: number;
  roe: number; // Rentabilidad sobre capital propio
  noi: number;
  paybackYears: number;
}

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
  const cuotaIrpfAnual = rendimientoReducido * (inputs.irpfMarginal / 100);

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
    cashFlowAnual,
    rentabilidadBruta,
    rentabilidadNeta,
    roe,
    noi: ebitda,
    paybackYears: cashFlowAnual > 0 ? capitalPropio / cashFlowAnual : Infinity
  };
}
