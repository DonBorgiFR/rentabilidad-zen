export interface TenantInputs {
  // Financials
  ingresoNetoMensual: number;
  rentaSolicitada: number;
  mesesFianza: number;
  mesesGarantiaAdicional: number;
  otrosGastosIniciales: number; // Mudanza, altas suministros, etc.
  
  // Property details for the comparator
  metrosCuadrados: number;
  zona: 'premium' | 'media' | 'periferia' | 'tensionada';
  estado: 'nuevo' | 'reformado' | 'bueno' | 'origen';
  habitaciones: number;
  banos: number;
  
  // Amenities (booleans)
  tieneAscensor: boolean;
  tieneParking: boolean;
  tieneTerraza: boolean;
  tieneAireAcondicionado: boolean;
}

export interface TenantResults {
  ratioEsfuerzo: number;
  esFavorable: boolean;
  pagoInicialRequerido: number;
  precioEstimadoMercado: number;
  diferenciaPorcentaje: number;
  veredictoPrecio: 'Oportunidad' | 'Precio de Mercado' | 'Sobreprecio Leve' | 'Sobreprecio Severo';
}

export function evaluateTenantScenario(inputs: TenantInputs): TenantResults {
  // 1. Financial Viability (Effort Ratio)
  const ratioEsfuerzo = (inputs.rentaSolicitada / inputs.ingresoNetoMensual) * 100;
  const esFavorable = ratioEsfuerzo <= 33;

  // 2. Initial Cash Required
  // Current month + Fianza (1 month legal) + Garantia Adicional (max 2 months legal) + others
  const pagoInicialRequerido = inputs.rentaSolicitada + 
                               (inputs.rentaSolicitada * inputs.mesesFianza) + 
                               (inputs.rentaSolicitada * inputs.mesesGarantiaAdicional) + 
                               inputs.otrosGastosIniciales;

  // 3. Heuristic Engine: Estimated Market Price
  // Base price per m2 depending on zone (Simulated average values for Spanish cities/Barcelona context)
  let precioBaseM2 = 12; 
  if (inputs.zona === 'premium') precioBaseM2 = 22;
  else if (inputs.zona === 'tensionada') precioBaseM2 = 18;
  else if (inputs.zona === 'media') precioBaseM2 = 16;
  else if (inputs.zona === 'periferia') precioBaseM2 = 13;

  let valorEstimado = inputs.metrosCuadrados * precioBaseM2;

  // Adjustments based on Condition
  if (inputs.estado === 'nuevo') valorEstimado *= 1.15;
  if (inputs.estado === 'reformado') valorEstimado *= 1.10;
  if (inputs.estado === 'origen') valorEstimado *= 0.85;

  // Adjustments based on Features
  if (inputs.tieneAscensor) valorEstimado *= 1.05; // 5% premium for elevator
  if (inputs.tieneParking) valorEstimado += 100;   // Flat premium for parking
  if (inputs.tieneTerraza) valorEstimado *= 1.08;  // 8% premium for terrace
  if (inputs.tieneAireAcondicionado) valorEstimado *= 1.03; 
  if (inputs.banos > 1) valorEstimado *= 1.05; // 5% premium for multiple bathrooms

  // Sanity check formatting
  valorEstimado = Math.round(valorEstimado);

  const diferencia = inputs.rentaSolicitada - valorEstimado;
  const diferenciaPorcentaje = (diferencia / valorEstimado) * 100;

  let veredictoPrecio: TenantResults['veredictoPrecio'] = 'Precio de Mercado';
  if (diferenciaPorcentaje < -5) veredictoPrecio = 'Oportunidad';
  else if (diferenciaPorcentaje > 20) veredictoPrecio = 'Sobreprecio Severo';
  else if (diferenciaPorcentaje > 5) veredictoPrecio = 'Sobreprecio Leve';

  return {
    ratioEsfuerzo,
    esFavorable,
    pagoInicialRequerido,
    precioEstimadoMercado: valorEstimado,
    diferenciaPorcentaje,
    veredictoPrecio
  };
}
