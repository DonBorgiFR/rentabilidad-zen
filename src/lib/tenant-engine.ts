// Heuristic market price model & Effort Ratio calculator for Tenants

export interface TenantInputs {
    ingresoNetoMensual: number;
    rentaSolicitada: number;
    mesesFianza: number;
    mesesGarantiaAdicional: number;
    otrosGastosIniciales: number;
    
    // Atributos Inmueble para tasador heurístico
    metrosCuadrados: number;
    zona: 'premium' | 'tensionada' | 'media' | 'periferia';
    estado: 'nuevo' | 'reformado' | 'bueno' | 'origen';
    habitaciones: number;
    banos: number;
    planta?: number;
    tieneAscensor: boolean;
    tieneParking: boolean;
    tieneTerraza: boolean;
    tieneAireAcondicionado: boolean;
  }
  
  export interface TenantResults {
    ratioEsfuerzo: number;
    pagoInicialRequerido: number;
    precioEstimadoMercado: number;
    veredictoPrecio: 'Oportunidad' | 'Precio Justo' | 'Sobreprecio Leve' | 'Sobreprecio Severo';
    diferenciaPorcentaje: number; // Negativo = chollo, Positivo = caro
    esFavorable: boolean; // Ratio esfuerzo < 33% = Favorable
  }
  
  export function evaluateTenantScenario(inputs: TenantInputs): TenantResults {
      // 1. Ratio Esfuerzo Financiero
      const ratioEsfuerzo = (inputs.rentaSolicitada / inputs.ingresoNetoMensual) * 100;
  
      // 2. Efectivo de Desembolso Inicial Requerido
      // Presupone 1 mes de alquiler adelantado (el corriente natural) + fianzas + extra
      const pagoInicialRequerido = 
          inputs.rentaSolicitada + 
          (inputs.rentaSolicitada * inputs.mesesFianza) + 
          (inputs.rentaSolicitada * inputs.mesesGarantiaAdicional) + 
          inputs.otrosGastosIniciales;
  
      // 3. Heurística de Tasador de Mercado ("Comparador")
      // Base Price per SQM by Zone
      const zonePrices = {
          'premium': 18.5,
          'tensionada': 15.0,
          'media': 11.5,
          'periferia': 9.0
      };
      
      let basePrice = inputs.metrosCuadrados * zonePrices[inputs.zona];
  
      // Multipliers / Additions based on features
      let conditionMultiplier = 1.0;
      if (inputs.estado === 'nuevo') conditionMultiplier = 1.25;
      if (inputs.estado === 'reformado') conditionMultiplier = 1.15;
      if (inputs.estado === 'bueno') conditionMultiplier = 1.0;
      if (inputs.estado === 'origen') conditionMultiplier = 0.85;
      
      basePrice = basePrice * conditionMultiplier;
  
      // Additions for Bathrooms/Rooms (basic premium for having more than standard 1B/1B per 50m2)
      if (inputs.banos > 1) basePrice += (inputs.banos - 1) * 75; 
      
      // Fixed extra premiums for highly desired amenities
      if (inputs.tieneAscensor && (inputs.planta !== undefined && inputs.planta > 1)) basePrice += 60; 
      else if (inputs.tieneAscensor) basePrice += 50;
      
      if (inputs.tieneParking) basePrice += 100;
      if (inputs.tieneTerraza) basePrice += 80;
      if (inputs.tieneAireAcondicionado) basePrice += 40;
  
      const precioEstimadoMercado = Math.round(basePrice);
  
      // 4. Veredicto Final
      const diferenciaAbsoluta = inputs.rentaSolicitada - precioEstimadoMercado;
      const diferenciaPorcentaje = (diferenciaAbsoluta / precioEstimadoMercado) * 100;
  
      let veredictoPrecio: TenantResults['veredictoPrecio'] = 'Precio Justo';
      if (diferenciaPorcentaje < -5) veredictoPrecio = 'Oportunidad';
      else if (diferenciaPorcentaje > 20) veredictoPrecio = 'Sobreprecio Severo';
      else if (diferenciaPorcentaje > 5) veredictoPrecio = 'Sobreprecio Leve';
  
      return {
          ratioEsfuerzo,
          pagoInicialRequerido,
          precioEstimadoMercado,
          veredictoPrecio,
          diferenciaPorcentaje,
          esFavorable: ratioEsfuerzo <= 33
      };
  }
