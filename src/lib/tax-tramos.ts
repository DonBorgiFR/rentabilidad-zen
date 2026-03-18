export type Region = 'madrid' | 'cataluna' | 'valencia' | 'andalucia' | 'otras';

interface TaxTram {
  minIncome: number;
  maxIncome: number;
  rate: number;
}

// Simplificación de tramos para el prototipo (estatal + autonómico aproximado)
export const TAX_TRAMOS: Record<Region, TaxTram[]> = {
  'madrid': [
    { minIncome: 0, maxIncome: 12450, rate: 0.185 },    
    { minIncome: 12450, maxIncome: 17707, rate: 0.235 },
    { minIncome: 17707, maxIncome: 33007, rate: 0.285 },
    { minIncome: 33007, maxIncome: 53407, rate: 0.365 },
    { minIncome: 53407, maxIncome: 60000, rate: 0.445 },
    { minIncome: 60000, maxIncome: 300000, rate: 0.45 },
    { minIncome: 300000, maxIncome: Infinity, rate: 0.47 }
  ],
  'cataluna': [
    { minIncome: 0, maxIncome: 12450, rate: 0.20 },
    { minIncome: 12450, maxIncome: 17707, rate: 0.24 },
    { minIncome: 17707, maxIncome: 33007, rate: 0.29 },
    { minIncome: 33007, maxIncome: 53407, rate: 0.385 },
    { minIncome: 53407, maxIncome: 60000, rate: 0.46 },
    { minIncome: 60000, maxIncome: 90000, rate: 0.46 },
    { minIncome: 90000, maxIncome: 120000, rate: 0.48 },
    { minIncome: 120000, maxIncome: 175000, rate: 0.49 },
    { minIncome: 175000, maxIncome: 300000, rate: 0.50 },
    { minIncome: 300000, maxIncome: Infinity, rate: 0.50 }
  ],
  'valencia': [
    { minIncome: 0, maxIncome: 12450, rate: 0.19 },
    { minIncome: 12450, maxIncome: 17707, rate: 0.24 },
    { minIncome: 17707, maxIncome: 33007, rate: 0.30 },
    { minIncome: 33007, maxIncome: 53407, rate: 0.37 },
    { minIncome: 53407, maxIncome: 60000, rate: 0.46 },
    { minIncome: 60000, maxIncome: 300000, rate: 0.47 },
    { minIncome: 300000, maxIncome: Infinity, rate: 0.49 }
  ],
  'andalucia': [
    { minIncome: 0, maxIncome: 12450, rate: 0.19 },
    { minIncome: 12450, maxIncome: 17707, rate: 0.24 },
    { minIncome: 17707, maxIncome: 33007, rate: 0.30 },
    { minIncome: 33007, maxIncome: 53407, rate: 0.37 },
    { minIncome: 53407, maxIncome: 60000, rate: 0.46 },
    { minIncome: 60000, maxIncome: 300000, rate: 0.47 },
    { minIncome: 300000, maxIncome: Infinity, rate: 0.47 }
  ],
  'otras': [
    { minIncome: 0, maxIncome: 12450, rate: 0.19 },
    { minIncome: 12450, maxIncome: 20200, rate: 0.24 },
    { minIncome: 20200, maxIncome: 35200, rate: 0.30 },
    { minIncome: 35200, maxIncome: 60000, rate: 0.37 },
    { minIncome: 60000, maxIncome: 300000, rate: 0.45 },
    { minIncome: 300000, maxIncome: Infinity, rate: 0.47 }
  ]
};

/**
 * Calcula el IRPF progresivo asumiendo que el rendimiento inmobiliario 
 * se suma al salario base (siendo conservadores y precisos).
 */
export function calculateProgressiveIRPF(netIncome: number, region: Region, baseSalary: number = 0): {
  totalTax: number;
  effectiveRate: number;
} {
  const tramos = TAX_TRAMOS[region] || TAX_TRAMOS['otras'];
  
  if (netIncome <= 0) return { totalTax: 0, effectiveRate: 0 };

  let totalTax = 0;
  // Income starts at the baseSalary level and goes up to baseSalary + netIncome
  let incomeToTax = netIncome;
  let currentIncomeLevel = baseSalary;
  
  for (const tram of tramos) {
    if (incomeToTax <= 0) break;
    
    // Si el currentIncomeLevel ya supera este tramo, pasamos al siguiente
    if (currentIncomeLevel >= tram.maxIncome) continue;
    
    // El espacio disponible en este tramo, tomando en cuenta el salario base
    const lowerBound = Math.max(tram.minIncome, currentIncomeLevel);
    const availableInTram = tram.maxIncome - lowerBound;
    
    // Cuánto de nuestro ingreso inmobiliario se tributa en este tramo
    const taxableInTram = Math.min(incomeToTax, availableInTram);
    
    totalTax += taxableInTram * tram.rate;
    incomeToTax -= taxableInTram;
    currentIncomeLevel += taxableInTram;
  }
  
  return {
    totalTax,
    effectiveRate: totalTax / netIncome
  };
}
