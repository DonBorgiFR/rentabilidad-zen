// Algoritmo de Precio Estimado Afinado con Dataset Idealista 2018
// Ajustado a 2025 usando evolución real de tipos de interés (Euribor)

export interface TenantInputs {
    ingresoNetoMensual: number;
    rentaSolicitada: number;
    mesesFianza: number;
    mesesGarantiaAdicional: number;
    otrosGastosIniciales: number;

    // Atributos Inmueble para tasador basado en dataset 2018
    municipio: string;
    barrio?: string;
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

// ============================================================================
// DATOS DEL DATASET IDEALISTA 2018 (Barcelona) AJUSTADOS A 2025
// ============================================================================

// Precios/m² 2018 por distancia al centro (dataset Idealista Barcelona)
const PRECIOS_M2_2018 = {
    'premium': 3929,    // 0-2km del centro
    'tensionada': 3625, // 2-4km
    'media': 2738,      // 4-6km
    'periferia': 2532   // 6-8km
};

// Ajuste temporal 2018 → 2025 basado en evolución Euribor
// Euribor 2018: -0.15% | Euribor 2025: ~2.1%
// Cambio: +2.25 puntos porcentuales × factor elasticidad 6 = +13.5%
const AJUSTE_TEMPORAL_2018_2025 = 1.135;

// Factores por municipio (vs Barcelona = 1.00)
// Fuentes: Índices de precios Ministerio de Transportes 2024
const FACTORES_MUNICIPIO: Record<string, number> = {
    'barcelona': 1.00,
    'madrid': 0.98,
    'valencia': 0.72,
    'sevilla': 0.62,
    'malaga': 0.78,
    'bilbao': 0.85,
    'zaragoza': 0.55,
    'palma': 0.90,
    'palma de mallorca': 0.90,
    'alicante': 0.65,
    'cordoba': 0.58,
    'valladolid': 0.52,
    'vigo': 0.60,
    'gijon': 0.62,
    'santander': 0.68,
    'granada': 0.63,
    'murcia': 0.58,
    'tarragona': 0.70,
    'girona': 0.75,
    'lleida': 0.50,
    'castellon': 0.55,
    'almeria': 0.60,
    'huelva': 0.52,
    'cadiz': 0.65,
    'jaen': 0.48,
    'ourense': 0.45,
    'pontevedra': 0.58,
    'la coruna': 0.65,
    'a coruna': 0.65,
    'santiago de compostela': 0.62,
    'burgos': 0.55,
    'leon': 0.50,
    'salamanca': 0.58,
    'toledo': 0.60,
    'cuenca': 0.42,
    'guadalajara': 0.55,
    'avila': 0.48,
    'segovia': 0.55,
    'soria': 0.45,
    'teruel': 0.42,
    'zamora': 0.45,
    'palencia': 0.48,
    'huesca': 0.52,
    'seu d\'urgell': 0.65,
    'ibiza': 0.88,
    'eivissa': 0.88,
    'menorca': 0.72,
    'mahon': 0.72,
    'mao': 0.72,
    'fuerteventura': 0.55,
    'lanzarote': 0.58,
    'tenerife': 0.62,
    'santa cruz de tenerife': 0.65,
    'la laguna': 0.62,
    'gran canaria': 0.60,
    'las palmas': 0.65,
    'las palmas de gran canaria': 0.65,
    'la gomera': 0.50,
    'el hierro': 0.45,
    'la palma': 0.52
};

// Multiplicadores base de características (del dataset 2018)
// Ascensor: +28.5%, Aire acondicionado: +17.1%, Parking: +8.4%, Terraza: +1.0%
// Ajustados para terrazas usables (de 1% a 5%)
const MULTIPLICADORES_BASE = {
    ascensor: 0.285,
    aireAcondicionado: 0.171,
    parking: 0.084,
    terraza: 0.05  // Ajustado de 0.01 a 0.05 para terrazas usables (>5m²)
};

// Factores de estado
const FACTORES_ESTADO = {
    'nuevo': 1.25,
    'reformado': 1.15,
    'bueno': 1.00,
    'origen': 0.85
};

// Rentabilidad bruta esperada para derivar precio de alquiler desde venta
const RENTABILIDAD_BRUTA_ESTIMADA = 0.05; // 5% anual

// ============================================================================
// FUNCIÓN PRINCIPAL DE CÁLCULO
// ============================================================================

/**
 * Calcula el precio estimado de venta basado en el dataset Idealista 2018
 * ajustado a 2025 mediante evolución del Euribor
 */
function calcularPrecioVentaEstimado(inputs: TenantInputs): number {
    // 1. Obtener factor de municipio (default 0.70 para municipios no listados)
    const municipioKey = inputs.municipio.toLowerCase().trim();
    const factorMunicipio = FACTORES_MUNICIPIO[municipioKey] ?? 0.70;

    // 2. Precio base según zona (datos 2018) ajustado temporal y por municipio
    const precioM2Base = PRECIOS_M2_2018[inputs.zona] * AJUSTE_TEMPORAL_2018_2025 * factorMunicipio;

    // 3. Calcular multiplicadores contextuales de características
    let multiplicadorCaracteristicas = 0;

    // Ascensor: más valioso en plantas altas y edificios antiguos
    if (inputs.tieneAscensor) {
        let factorAscensor = MULTIPLICADORES_BASE.ascensor;

        // Ajuste por planta
        if (inputs.planta !== undefined) {
            if (inputs.planta >= 4) {
                factorAscensor *= 1.3;  // +30% si es planta alta
            } else if (inputs.planta <= 1) {
                factorAscensor *= 0.6;  // -40% si es bajo o planta 1
            }
        }

        // Ajuste por zona
        if (inputs.zona === 'premium') {
            factorAscensor *= 1.2;  // +20% en zona premium
        } else if (inputs.zona === 'periferia') {
            factorAscensor *= 0.8;  // -20% en periferia
        }

        multiplicadorCaracteristicas += factorAscensor;
    }

    // Aire acondicionado: más valioso en climas cálidos y zonas premium
    if (inputs.tieneAireAcondicionado) {
        let factorAA = MULTIPLICADORES_BASE.aireAcondicionado;

        if (inputs.zona === 'premium') {
            factorAA *= 1.15;  // +15% en zona premium
        }

        multiplicadorCaracteristicas += factorAA;
    }

    // Parking: más valioso en zonas tensionadas (dificultad para aparcar)
    if (inputs.tieneParking) {
        let factorParking = MULTIPLICADORES_BASE.parking;

        if (inputs.zona === 'tensionada') {
            factorParking *= 1.4;  // +40% si es difícil aparcar
        } else if (inputs.zona === 'periferia') {
            factorParking *= 0.7;  // -30% si hay parking fácil
        }

        multiplicadorCaracteristicas += factorParking;
    }

    // Terraza: más valiosa en zonas premium y climas cálidos
    if (inputs.tieneTerraza) {
        let factorTerraza = MULTIPLICADORES_BASE.terraza;

        if (inputs.zona === 'premium') {
            factorTerraza *= 2.0;  // Doble valor en centro
        }

        multiplicadorCaracteristicas += factorTerraza;
    }

    // 4. Aplicar factor de estado
    const factorEstado = FACTORES_ESTADO[inputs.estado];

    // 5. Cálculo final del precio de venta
    const precioVentaEstimado = Math.round(
        inputs.metrosCuadrados *
        precioM2Base *
        (1 + multiplicadorCaracteristicas) *
        factorEstado
    );

    return precioVentaEstimado;
}

/**
 * Deriva el precio de alquiler estimado desde el precio de venta
 * usando una rentabilidad bruta objetivo
 */
function calcularPrecioAlquilerDesdeVenta(precioVenta: number): number {
    // Renta mensual = (Precio venta × Rentabilidad bruta) / 12 meses
    const rentaMensualEstimada = (precioVenta * RENTABILIDAD_BRUTA_ESTIMADA) / 12;
    return Math.round(rentaMensualEstimada);
}

// ============================================================================
// FUNCIÓN PRINCIPAL EXPORTADA
// ============================================================================

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

    // 3. Tasador de Mercado basado en Dataset Idealista 2018 ajustado 2025
    const precioVentaEstimado = calcularPrecioVentaEstimado(inputs);
    const precioEstimadoMercado = calcularPrecioAlquilerDesdeVenta(precioVentaEstimado);

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

// ============================================================================
// FUNCIONES AUXILIARES PARA EXPORTAR (útil para debugging y calibración)
// ============================================================================

/**
 * Obtiene el factor de municipio para un municipio dado
 */
export function getFactorMunicipio(municipio: string): number {
    return FACTORES_MUNICIPIO[municipio.toLowerCase().trim()] ?? 0.70;
}

/**
 * Lista todos los municipios soportados
 */
export function getMunicipiosSoportados(): string[] {
    return Object.keys(FACTORES_MUNICIPIO).sort();
}

/**
 * Verifica si un municipio está soportado
 */
export function isMunicipioSoportado(municipio: string): boolean {
    return municipio.toLowerCase().trim() in FACTORES_MUNICIPIO;
}
