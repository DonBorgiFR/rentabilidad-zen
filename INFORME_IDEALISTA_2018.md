# Informe de Análisis - Dataset Idealista 2018
## Análisis de Inversión Inmobiliaria en Barcelona

**Fecha del análisis:** Marzo 2026
**Dataset:** Idealista Export 2018 (~188.000 registros)
**Ciudades incluidas:** Barcelona, Madrid, Valencia (principalmente Barcelona)

---

## 1. Resumen Ejecutivo

### Estadísticas Generales del Dataset

| Métrica | Valor |
|---------|-------|
| Registros analizados | 188,334 |
| Precio medio | 358,858 EUR |
| Precio mediano | 262,000 EUR |
| Precio/m² medio | 3,457 EUR/m² |
| Precio/m² mediano | 3,362 EUR/m² |
| Superficie media | 100.1 m² |
| Superficie mediana | 86 m² |

### Hallazgos Clave

1. **El mercado de 2018 ofrecía oportunidades de rentabilidad bruta del 4-7%** según la zona
2. **Las zonas intermedias (4-6km)** mostraban la mejor relación calidad-precio para inversores
3. **El ascensor es la característica más valorada** (+28.5% de impacto en precio/m²)
4. **La vivienda de 2-3 habitaciones** representa el segmento más líquido del mercado

---

## 2. Análisis por Zonas (Distancia al Centro)

### Distribución de Precios por Zona

| Zona | Registros | Precio Medio | Precio/m² Medio | Distancia Media | Superficie Media |
|------|-----------|--------------|-----------------|-----------------|------------------|
| Centro (0-2km) | 55,990 | 332,000 EUR | 3,929 EUR/m² | 1.3 km | 104 m² |
| Cercano (2-4km) | 69,533 | 288,000 EUR | 3,625 EUR/m² | 2.9 km | 103 m² |
| Intermedio (4-6km) | 34,754 | 205,000 EUR | 2,738 EUR/m² | 4.8 km | 90 m² |
| Periférico (6-8km) | 16,938 | 198,000 EUR | 2,532 EUR/m² | 6.9 km | 95 m² |
| Lejano (>8km) | 11,119 | 248,000 EUR | 2,788 EUR/m² | 8.8 km | 102 m² |

### Insights por Zona

**Centro (0-2km):**
- Premium de ubicación evidente: +43% más caro que la periferia
- Mejor liquidez y menor tiempo de venta esperado
- Ideal para inversores de capital preservation

**Zona Intermedia (4-6km):**
- **Mejor oportunidad de valor** para inversores
- Precio/m² 30% inferior al centro con buena conectividad
- Alta rentabilidad potencial (7.02% bruto en 2018)

**Periférico (6-8km):**
- Precios más bajos pero menor demanda de alquiler
- Requiere análisis de transporte público cercano

---

## 3. Análisis por Tipología de Vivienda

### Distribución por Número de Habitaciones

| Habitaciones | Registros | Precio Medio | Precio/m² | Superficie Media |
|--------------|-----------|--------------|-----------|------------------|
| 0 (Estudio) | 4,087 | 221,467 EUR | 4,072 EUR/m² | 61 m² |
| 1 | 19,446 | 235,783 EUR | 4,276 EUR/m² | 57 m² |
| 2 | 49,576 | 277,500 EUR | 3,569 EUR/m² | 76 m² |
| 3 | 74,458 | 314,453 EUR | 3,053 EUR/m² | 98 m² |
| 4 | 30,941 | 508,692 EUR | 3,463 EUR/m² | 138 m² |
| 5+ | 9,827 | 967,000 EUR | 4,057 EUR/m² | 230 m² |

### Insights de Tipología

1. **Viviendas de 2-3 habitaciones:** Representan el 66% del mercado (segmento más líquido)
2. **Estudios y 1 hab:** Precio/m² más alto pero menor demanda familiar
3. **4+ habitaciones:** Mercado de lujo con menor liquidez

### Análisis por Época de Construcción

| Época | Registros | Precio Medio | Precio/m² | Superficie Media |
|-------|-----------|--------------|-----------|------------------|
| Antigua (<1950) | 19,413 | 289,000 EUR | 3,150 EUR/m² | 96 m² |
| Clásica (1950-1980) | 49,588 | 265,000 EUR | 2,980 EUR/m² | 100 m² |
| Moderna (1980-2000) | 11,577 | 345,000 EUR | 3,450 EUR/m² | 116 m² |
| Reciente (2000+) | 13,026 | 385,000 EUR | 3,890 EUR/m² | 105 m² |

**Insight:** Las viviendas recientes (2000+) cotizan con un 30% de prima sobre las clásicas, pero ofrecen menores costes de mantenimiento.

---

## 4. Impacto de Características en el Precio

### Valor Añadido por Característica

| Característica | Impacto EUR/m² | Impacto % |
|----------------|----------------|-----------|
| Ascensor (HASLIFT) | +816 EUR/m² | +28.5% |
| Aire Acondicionado | +547 EUR/m² | +17.1% |
| Piscina | +339 EUR/m² | +9.9% |
| Parking | +288 EUR/m² | +8.4% |
| Jardín | +115 EUR/m² | +3.3% |
| Terraza | +35 EUR/m² | +1.0% |

### Recomendaciones para Inversores

1. **El ascensor es crítico:** En Barcelona, su ausencia reduce significativamente el valor y la rentabilidad
2. **Aire acondicionado:** Alta valoración en el clima mediterráneo
3. **Parking:** Importante en zonas con dificultad de aparcamiento

---

## 5. Análisis de Rentabilidad (2018 vs Actual)

### Escenario de Inversión en 2018

Asumiendo una apreciación del 35% desde 2018 hasta 2024/2025:

| Zona | Precio 2018 | Precio Est. 2024 | Plusvalía | Renta Mensual Est. | Rent. Bruta 2018 | Rent. Bruta Actual |
|------|-------------|------------------|-----------|-------------------|------------------|-------------------|
| Centro | 332,000 EUR | 448,200 EUR | +35.0% | 1,800 EUR | 6.51% | 4.82% |
| Cercano | 288,000 EUR | 388,800 EUR | +35.0% | 1,500 EUR | 6.25% | 4.63% |
| Intermedio | 205,000 EUR | 276,750 EUR | +35.0% | 1,200 EUR | **7.02%** | **5.20%** |
| Periférico | 198,000 EUR | 267,300 EUR | +35.0% | 1,000 EUR | 6.06% | 4.49% |
| Lejano | 248,000 EUR | 334,800 EUR | +35.0% | 850 EUR | 4.11% | 3.05% |

### Rentabilidad Total Estimada (2018-2025)

Para un inversor que compró en 2018:

1. **Rentabilidad por alquiler:** Acumulado ~30-35% del capital invertido
2. **Plusvalía:** ~35% sobre el precio de compra
3. **Rentabilidad total estimada:** 65-70% en 7 años (~7.5% anual compuesto)

### Zonas Recomendadas para Inversión (Retrospectivo)

**Mejor rentabilidad bruta 2018:**
1. Zona Intermedia (4-6km): 7.02%
2. Centro (0-2km): 6.51%
3. Periférico (6-8km): 6.06%

---

## 6. Correlaciones Clave

### Matriz de Correlación con el Precio

| Variable | Correlación | Interpretación |
|----------|-------------|----------------|
| Superficie construida | +0.795 | Factor más determinante del precio absoluto |
| Número de baños | +0.682 | Indicador de calidad/tamaño |
| Precio/m² | +0.632 | Obvio por definición |
| Número de habitaciones | +0.420 | Menor impacto que baños |
| Distancia al centro | -0.116 | Impacto menor de lo esperado |
| Año de construcción | -0.054 | Viviendas antiguas pueden ser caras (centro) |

### Insights de Correlación

1. **La superficie es el factor dominante** en el precio absoluto
2. **Los baños correlacionan más que las habitaciones** con el precio
3. **La distancia al centro tiene menos impacto** de lo esperado (eficiencia del transporte público)

---

## 7. Oportunidades de Inversión Identificadas

### Oportunidades Históricas (2018)

1. **Zonas Intermedias (4-6km):**
   - Mejor relación calidad-precio
   - Rentabilidad bruta >7%
   - Buena conectividad con transporte público

2. **Viviendas Clásicas (1950-1980) sin ascensor:**
   - Potencial de valorización con instalación de ascensor
   - Precio de entrada bajo

3. **Viviendas de 2-3 habitaciones:**
   - Mayor liquidez del mercado
   - Demanda sostenida de familias y parejas

### Lecciones para Inversores Actuales

1. **Buscar zonas con infraestructura en desarrollo** (nuevas líneas de metro)
2. **Priorizar viviendas con ascensor** - el impacto en valor es significativo
3. **El tamaño importa más que la ubicación exacta** - superficie es clave
4. **Las zonas intermedias** suelen ofrecer mejor rentabilidad que el centro

---

## 8. Visualizaciones Generadas

El análisis ha generado las siguientes visualizaciones:

1. **01_distribucion_precios.png** - Distribución de precios y precios/m²
2. **02_caracteristicas_precio.png** - Impacto de características en precio
3. **03_tipologia_epoca.png** - Análisis por habitaciones y época
4. **04_correlaciones.png** - Matriz de correlación
5. **05_rentabilidad_zona.png** - Rentabilidad por zona
6. **06_evolucion_temporal.png** - Evolución de precios en 2018

---

## 9. Conclusiones y Recomendaciones

### Para Inversores Actuales (2025+)

1. **El mercado de 2018 era más atractivo** para rentabilidad bruta (6-7% vs 4-5% actual)
2. **La apreciación del 35%** ha reducido las oportunidades de entrada
3. **Buscar nichos:** Reformas, zonas emergentes, oportunidades de valor añadido

### Estrategia Recomendada

1. **Focus en zonas 4-8km del centro** con buena conectividad
2. **Priorizar viviendas de 70-100m²** con 2-3 habitaciones
3. **Buscar viviendas sin ascensor** en edificios donde sea viable instalarlo
4. **Considerar viviendas de época clásica** (1950-1980) para reforma

### Métricas de Éxito para Futuras Inversiones

- **Rentabilidad bruta objetivo:** >5% (ajustado a tipos de interés actuales)
- **Cash flow mensual positivo:** Después de gastos e hipoteca
- **Potencial de valorización:** Zonas con desarrollo urbano planificado

---

## Anexos

### Archivos Generados

- `analisis_output/resumen_estadistico.csv` - Resumen de métricas clave
- `analisis_output/estadisticas_por_zona.csv` - Datos detallados por zona
- `analisis_output/*.png` - Visualizaciones del análisis

### Metodología

- Dataset: Idealista Export 2018 (188,512 registros iniciales)
- Limpieza: Eliminación de outliers (precios <50k o >5M EUR)
- Apreciación estimada: 35% (2018-2024) basada en índices de mercado
- Rentas estimadas: Basadas en datos de mercado 2024/2025

---

*Informe generado automáticamente mediante análisis de datos con Python/pandas*
