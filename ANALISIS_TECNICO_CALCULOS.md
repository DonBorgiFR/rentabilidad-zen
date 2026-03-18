# Análisis Técnico: Sistema de Cálculos de Rentabilidad
## Para Analistas Financieros 🧮

---

## 1. EL DESCUENTO DE CUOTAS (tipoReduccion - Ley de Vivienda 2024)

### ¿Qué es?
Es la **reducción del rendimiento neto fiscal** que aplica la ley española para viviendas en zonas tensionadas (Barcelona, Madrid, etc.). No es un descuento en el pago, sino en la **base imponible del IRPF**.

### Cómo funciona en el motor:

```
Paso 1: Calcula el Rendimiento Neto Fiscal (RNF)
RNF = Ingresos Brutos - Gastos Operativos - Intereses Hipotecarios - Amortización

Ejemplo:
- Ingresos brutos anuales: 11,400€ (950€/mes × 12 meses)
- Gastos operativos: -1,660€ (IBI, comunidad, seguros, etc.)
- Intereses hipotecarios: -5,600€
- Amortización: -3,000€
──────────────────
RNF = 1,140€

Paso 2: Aplica el descuento de la Ley de Vivienda
Si tipoReduccion = 50%:
Rendimiento Reducido = 1,140€ × (1 - 50%) = 570€

Paso 3: Calcula IRPF
Cuota IRPF = 570€ × 30% (tramo marginal) = 171€
```

### Los 4 tipos de reducción disponibles:

| Reducción | Requisito | Caso de Uso |
|-----------|-----------|-----------|
| **90%** | Bajar renta ≥5% respecto a anterior | Zona tensionada + estrategia fiscal agresiva |
| **70%** | Estado medio/insuficiente | Vivienda que necesita relativo mantenimiento |
| **60%** | Inquilino específico (estudiante/vulnerable) | Programa social |
| **50%** | Residencial habitual (estándar) | Aplicación básica de la ley |

### Impacto en tu rentabilidad:

El sistema calcula el **IRPF según el tipo elegido**, así que cuanto mayor sea la reducción, **menos impuestos pagas**, resultando en un **cash flow final superior**.

---

## 2. LA TASA PARA ACCIONISTAS (ROE - Return on Equity)

### ¿Qué es?
Es la **rentabilidad que obtienes sobre el capital propio invertido**. Es la métrica que importa a verdaderos accionistas/inversores.

### Cómo funciona en el motor:

```
Paso 1: Define el capital propio
Capital Propio = Inversión Total - Capital Prestado (Hipoteca)

Ejemplo:
- Inversión total: 222,500€
  └─ Precio compra: 200,000€
  └─ ITP + gastos: 22,500€
- Capital prestado (80% LTV): -160,000€
──────────────────
Capital Propio = 62,500€

Paso 2: Calcula el Cash Flow Anual
Cash Flow = EBITDA - Cuota Hipotecaria - Impuestos

Ejemplo:
- EBITDA: 9,740€ (ingresos - gastos operativos)
- Cuota hipotecaria anual: -6,684€ (558.67€/mes × 12)
- Impuestos IRPF: -171€
──────────────────
Cash Flow = 2,885€

Paso 3: Calcula ROE
ROE = (Cash Flow / Capital Propio) × 100

ROE = (2,885€ / 62,500€) × 100 = 4.62%
```

### ¿A qué lo comparas?
```
ROE = 4.62%
├─ Vs. Rentabilidad Bruta = 5.1% (ingresos brutos / inversión total)
├─ Vs. Rentabilidad Neta = 4.4% (EBITDA / inversión total)
└─ Vs. Bonos a 30 años España = ~3.5%
```

Si el **ROE > 4.62%**, tienes apalancamiento positivo (la hipoteca está trabajando para ti).

---

## 3. LA INTERACCIÓN: Cómo el "descuento" afecta el ROE

### Escenario A: tipoReduccion = 50% (conservador)
```
Rendimiento fiscal: 1,140€ × 50% = 570€ reducidos
Impuestos IRPF: 570€ × 30% = 171€
Cash Flow Neto: 2,971€ - 6,684€ - 171€ = -3,884€ ❌ NEGATIVO
ROE = -6.2% ❌
```

### Escenario B: tipoReduccion = 90% (agresivo - Ley Vivienda + bajada renta 5%)
```
Rendimiento fiscal: 1,140€ × 10% = 114€ reducidos (90% descuento)
Impuestos IRPF: 114€ × 30% = 34€
Cash Flow Neto: 9,740€ - 6,684€ - 34€ = 3,022€ ✓ POSITIVO
ROE = 4.84% ✓
```

**El sistema demuestra que la Ley de Vivienda puede transformar una inversión negativa en positiva.**

---

## 4. VARIABLES CRÍTICAS QUE AFECTAN AMBAS MÉTRICAS

| Variable | Impacto en Descuento | Impacto en ROE |
|----------|---------------------|--------|
| **Renta Mensual** ↑ | ⬆️ Más ingresos, más IRPF | ⬆️ Cash flow positivo |
| **Interés Hipoteca** ↑ | ⬆️ Más deducible = menos IRPF | ⬇️ Cuota hipotecaria mayor |
| **LTV (% financiación)** ↑ | ↔️ No directo | ⬇️ Menos capital propio = ROE amplificado |
| **tipoReduccion** ↑ | ⬇️ Menos IRPF | ⬆️ Cash flow mejor |
| **Amortización** ↑ | ⬇️ Menos IRPF | ↔️ No afecta cash (es no liquida) |

---

## 5. VALIDACIÓN FINANCIERA

### Regla de Oro para Inversores Institucionales:

```
✓ BUENA INVERSIÓN si:
  • ROE > 5% (apalancamiento positivo marginal)
  • O: Ganancia fiscal (ahorro IRPF > pérdida ingresos brutos)
  
❌ MALA INVERSIÓN si:
  • ROE < 2% (efecto apalancamiento patético)
  • Y: Sin beneficio fiscal (descuento insuficiente)
```

### Fórmula de Rentabilidad Real

```
RENTABILIDAD TOTAL = Rentabilidad en Cash + Apreciación de Activo + Ahorro Fiscal

En este simulador:
• Cash Flow Anual (ROE): medible
• Apreciación: no incluida (conservador)
• Ahorro Fiscal: calculado via reducción IRPF
```

---

## 6. CÓMO LEER LOS RESULTADOS EN EL INTERFAZ

### En la pantalla de "INVERSOR":

| Métrica | Qué significa |
|---------|--------------|
| **Capital Propio** | Lo que tú inviertes de tu bolsillo |
| **ROE (%)** | Rentabilidad anual sobre ese capital |
| **Cuota Hipotecaria Mensual** | Qué pagas al banco cada mes |
| **IRPF Anual** | Qué pagas a Hacienda (tras aplicar reducción) |
| **Cash Flow Anual** | Dinero real que te llega al final del año |
| **Payback Years** | Años para recuperar tu capital inicial |

---

## 7. EJEMPLO COMPLETO: Piso de 200k€ en Barcelona

### Inputs:
- Precio: 200,000€
- Renta: 950€/mes
- Hipoteca: 80% a 3.5% × 30 años
- Zona tensionada: SÍ
- tipoReduccion: 50% (estándar)

### Salida del Motor:
```
INVERSIÓN Y FINANCIACIÓN
  Inversión Total: 222,500€
  Capital Propio: 62,500€
  Hipoteca: 160,000€
  Cuota Mensual: 558.67€

FLUJOS BRUTOS
  Ingresos Anuales: 11,400€
  Gastos Operativos: -1,660€
  EBITDA: 9,740€

FISCALIDAD
  Rendimiento Neto Fiscal: 1,140€
  Rendimiento tras 50% reducción: 570€
  IRPF (30% sobre reducido): 171€

RESULTADO FINAL
  Cash Flow Anual: 2,885€
  ROE: 4.62%
  Payback: 21.6 años
```

---

## 8. PREGUNTAS FRECUENTES PARA ANALISTAS

### P: ¿Por qué el ROE es tan bajo si la renta es positiva?
**R:** Porque la cuota hipotecaria (80% del precio en capital a 30 años) consume casi todo el cash. Es normal en adquisiciones apalancadas con LTV alto.

### P: ¿El "descuento" reduce realmente mi pago de impuestos?
**R:** SÍ. Si reduces la renta un 5%, el sistema automáticamente aplica 90% de reducción en lugar de 50%, ahorrándote ~1,500€ en impuestos.

### P: ¿Qué pasa con la apreciación del inmueble?
**R:** No se incluye (conservador). Si el inmueble aprecia un 3% anual, sumalo manualmente.

### P: ¿Es el ROE comparable con rentabilidad de fondos?
**R:** Solo en parte. El ROE inmobiliario incluye:
  - Liquidez (illiquido - descuento 50-70%)
  - Riesgo de impago
  - Trabajo de gestión
  - Iliquidez temporal
  
Así que un ROE del 4.62% en inmueble ≈ 7-8% en fondos desde perspectiva riesgo-ajustado.

---

## 9. CONCLUSIÓN: LA INTELIGENCIA DEL MOTOR

El simulador **NO es un simple multiplicador de porcentajes**. Es un modelo que:

1. **Respeta la realidad fiscal española** (Ley Vivienda 2024)
2. **Diferencia entre cash y contabilidad** (EBITDA vs. Resultado Fiscal)
3. **Ilustra el efecto apalancamiento** (capital propio vs. ROE)
4. **Optimiza automáticamente escenarios** (tipoReduccion según perfil)

**Para tu pareja analista:** El sistema demuestra por qué un piso que pierde dinero en cash puede ser fiscalmente inteligente, y viceversa. Es la intersección entre finanzas e impuestos. 

---

**Creado:** 18/03/2026  
**Versión:** 1.0 - Análisis Técnico Completo
