#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analisis Completo Dataset Idealista 2018 - Barcelona
Analisis de inversion inmobiliaria historica
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Backend sin interfaz grafica
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
import os
warnings.filterwarnings('ignore')

# Configuracion de estilo
plt.style.use('default')
sns.set_palette("husl")

print("=" * 80)
print("ANALISIS DATASET IDEALISTA 2018 - BARCELONA")
print("=" * 80)

# =============================================================================
# 1. CARGA Y LIMPIEZA DE DATOS
# =============================================================================
print("\nCARGANDO DATASET...")
df = pd.read_csv("dataset 2018/idealista_export.csv")

print(f"Registros totales: {len(df):,}")
print(f"Columnas: {len(df.columns)}")
print(f"\nColumnas disponibles:")
for col in df.columns:
    print(f"  - {col}")

# Informacion basica
print(f"\nINFORMACION BASICA:")
print(f"Ciudades en dataset: {df['CIUDAD'].unique()}")
print(f"Periodos disponibles: {sorted(df['PERIOD'].unique())}")

# =============================================================================
# 2. LIMPIEZA Y PREPARACION
# =============================================================================
print("\n" + "=" * 80)
print("2. LIMPIEZA Y PREPARACION DE DATOS")
print("=" * 80)

# Crear copia para trabajar
df_clean = df.copy()

# Convertir PERIOD a fecha
df_clean['PERIOD_DATE'] = pd.to_datetime(df_clean['PERIOD'].astype(str), format='%Y%m')
df_clean['YEAR'] = df_clean['PERIOD_DATE'].dt.year
df_clean['MONTH'] = df_clean['PERIOD_DATE'].dt.month

# Limpiar valores nulos en precios
df_clean = df_clean.dropna(subset=['PRICE', 'UNITPRICE'])

# Filtrar outliers extremos (precios entre 50k y 5M)
df_clean = df_clean[(df_clean['PRICE'] >= 50000) & (df_clean['PRICE'] <= 5000000)]
df_clean = df_clean[(df_clean['UNITPRICE'] >= 500) & (df_clean['UNITPRICE'] <= 20000)]

# Limpiar areas
if 'CONSTRUCTEDAREA' in df_clean.columns:
    df_clean = df_clean[df_clean['CONSTRUCTEDAREA'] > 0]
    df_clean = df_clean[df_clean['CONSTRUCTEDAREA'] <= 500]  # Filtrar areas extremas

print(f"Registros despues de limpieza: {len(df_clean):,}")
print(f"Registros eliminados: {len(df) - len(df_clean):,}")

# =============================================================================
# 3. ANALISIS ESTADISTICO DESCRIPTIVO
# =============================================================================
print("\n" + "=" * 80)
print("3. ANALISIS ESTADISTICO DESCRIPTIVO")
print("=" * 80)

# Estadisticas basicas de precios
print("\nESTADISTICAS DE PRECIOS:")
price_stats = df_clean['PRICE'].describe()
print(price_stats)

print("\nESTADISTICAS DE PRECIO POR M2:")
unit_stats = df_clean['UNITPRICE'].describe()
print(unit_stats)

print("\nESTADISTICAS DE SUPERFICIE:")
if 'CONSTRUCTEDAREA' in df_clean.columns:
    area_stats = df_clean['CONSTRUCTEDAREA'].describe()
    print(area_stats)

# =============================================================================
# 4. ANALISIS POR DISTANCIA AL CENTRO (PROXY DE ZONAS)
# =============================================================================
print("\n" + "=" * 80)
print("4. ANALISIS POR DISTANCIA AL CENTRO")
print("=" * 80)

# Crear categorias de distancia al centro
def categorize_distance(dist):
    if pd.isna(dist):
        return 'Desconocido'
    elif dist <= 2:
        return 'Centro (0-2km)'
    elif dist <= 4:
        return 'Cercano (2-4km)'
    elif dist <= 6:
        return 'Intermedio (4-6km)'
    elif dist <= 8:
        return 'Periferico (6-8km)'
    else:
        return 'Lejano (>8km)'

df_clean['ZONA'] = df_clean['DISTANCE_TO_CITY_CENTER'].apply(categorize_distance)

# Analisis por zona
zona_stats = df_clean.groupby('ZONA').agg({
    'PRICE': ['count', 'mean', 'median', 'std'],
    'UNITPRICE': ['mean', 'median'],
    'CONSTRUCTEDAREA': 'mean'
}).round(2)

zona_stats.columns = ['_'.join(col).strip() for col in zona_stats.columns]
print("\nESTADISTICAS POR ZONA (distancia al centro):")
print(zona_stats)

# =============================================================================
# 5. ANALISIS POR CARACTERISTICAS
# =============================================================================
print("\n" + "=" * 80)
print("5. ANALISIS POR CARACTERISTICAS DE LA VIVIENDA")
print("=" * 80)

# Analisis por numero de habitaciones
if 'ROOMNUMBER' in df_clean.columns:
    print("\nANALISIS POR NUMERO DE HABITACIONES:")
    room_stats = df_clean.groupby('ROOMNUMBER').agg({
        'PRICE': ['count', 'mean', 'median'],
        'UNITPRICE': 'mean',
        'CONSTRUCTEDAREA': 'mean'
    }).round(2)
    room_stats.columns = ['_'.join(col).strip() for col in room_stats.columns]
    print(room_stats.head(10))

# Analisis por caracteristicas booleanas
bool_features = ['HASTERRACE', 'HASLIFT', 'HASAIRCONDITIONING', 'HASPARKINGSPACE',
                 'HASSWIMMINGPOOL', 'HASGARDEN']

print("\nIMPACTO DE CARACTERISTICAS EN PRECIO:")
for feature in bool_features:
    if feature in df_clean.columns:
        with_feature = df_clean[df_clean[feature] == 1]['UNITPRICE'].mean()
        without_feature = df_clean[df_clean[feature] == 0]['UNITPRICE'].mean()
        if pd.notna(with_feature) and pd.notna(without_feature):
            diff = with_feature - without_feature
            pct = (diff / without_feature) * 100 if without_feature > 0 else 0
            print(f"  {feature}: +{diff:.0f} EUR/m2 (+{pct:.1f}%) con la caracteristica")

# =============================================================================
# 6. ANALISIS POR ANO DE CONSTRUCCION
# =============================================================================
print("\n" + "=" * 80)
print("6. ANALISIS POR ANO DE CONSTRUCCION")
print("=" * 80)

if 'CONSTRUCTIONYEAR' in df_clean.columns:
    # Limpiar anos
    df_clean['CONSTRUCTIONYEAR_CLEAN'] = pd.to_numeric(df_clean['CONSTRUCTIONYEAR'], errors='coerce')
    df_clean = df_clean[(df_clean['CONSTRUCTIONYEAR_CLEAN'] >= 1900) &
                        (df_clean['CONSTRUCTIONYEAR_CLEAN'] <= 2020)]

    # Categorizar por epoca
    def categorize_year(year):
        if pd.isna(year):
            return 'Desconocido'
        elif year < 1950:
            return 'Antigua (<1950)'
        elif year < 1980:
            return 'Clasica (1950-1980)'
        elif year < 2000:
            return 'Moderna (1980-2000)'
        else:
            return 'Reciente (2000+)'

    df_clean['EPOCA'] = df_clean['CONSTRUCTIONYEAR_CLEAN'].apply(categorize_year)

    print("\nESTADISTICAS POR EPOCA DE CONSTRUCCION:")
    epoca_stats = df_clean.groupby('EPOCA').agg({
        'PRICE': ['count', 'mean', 'median'],
        'UNITPRICE': 'mean',
        'CONSTRUCTEDAREA': 'mean'
    }).round(2)
    epoca_stats.columns = ['_'.join(col).strip() for col in epoca_stats.columns]
    print(epoca_stats)

# =============================================================================
# 7. CORRELACIONES
# =============================================================================
print("\n" + "=" * 80)
print("7. MATRIZ DE CORRELACION")
print("=" * 80)

# Seleccionar columnas numericas relevantes
corr_cols = ['PRICE', 'UNITPRICE', 'CONSTRUCTEDAREA', 'ROOMNUMBER', 'BATHNUMBER',
             'DISTANCE_TO_CITY_CENTER', 'DISTANCE_TO_METRO', 'CONSTRUCTIONYEAR_CLEAN']

corr_cols = [col for col in corr_cols if col in df_clean.columns]
correlation_matrix = df_clean[corr_cols].corr()

print("\nCORRELACIONES CON EL PRECIO:")
price_corr = correlation_matrix['PRICE'].sort_values(ascending=False)
for var, corr in price_corr.items():
    if var != 'PRICE':
        print(f"  {var}: {corr:.3f}")

# =============================================================================
# 8. ANALISIS DE RENTABILIDAD POTENCIAL
# =============================================================================
print("\n" + "=" * 80)
print("8. ANALISIS DE RENTABILIDAD POTENCIAL (2018 vs ACTUAL)")
print("=" * 80)

# Precios actuales estimados (2024/2025) - Barcelona
# Basado en tendencias de mercado: ~30-40% de apreciacion desde 2018
APRECIACION_ESTIMADA = 1.35  # 35% de apreciacion estimada

# Rentas estimadas por zona (EUR/mes) - 2024/2025
rentas_estimadas = {
    'Centro (0-2km)': 1800,
    'Cercano (2-4km)': 1500,
    'Intermedio (4-6km)': 1200,
    'Periferico (6-8km)': 1000,
    'Lejano (>8km)': 850,
    'Desconocido': 1100
}

# Calcular metricas de rentabilidad
print("\nRENTABILIDAD BRUTA ESTIMADA (si se compro en 2018):")
print("-" * 80)

for zona in df_clean['ZONA'].unique():
    if zona == 'Desconocido':
        continue

    zona_data = df_clean[df_clean['ZONA'] == zona]
    precio_medio_2018 = zona_data['PRICE'].median()
    precio_estimado_2024 = precio_medio_2018 * APRECIACION_ESTIMADA

    # Renta anual estimada
    renta_mensual = rentas_estimadas.get(zona, 1100)
    renta_anual = renta_mensual * 12

    # Rentabilidad bruta
    rent_bruta = (renta_anual / precio_medio_2018) * 100
    rent_bruta_actual = (renta_anual / precio_estimado_2024) * 100

    # Plusvalia estimada
    plusvalia = precio_estimado_2024 - precio_medio_2018
    plusvalia_pct = (plusvalia / precio_medio_2018) * 100

    print(f"\n{zona}:")
    print(f"  Precio medio 2018: {precio_medio_2018:,.0f} EUR")
    print(f"  Precio estimado 2024: {precio_estimado_2024:,.0f} EUR")
    print(f"  Plusvalia estimada: {plusvalia:,.0f} EUR ({plusvalia_pct:.1f}%)")
    print(f"  Renta mensual estimada: {renta_mensual:,} EUR")
    print(f"  Rentabilidad bruta 2018: {rent_bruta:.2f}%")
    print(f"  Rentabilidad bruta actual: {rent_bruta_actual:.2f}%")

# =============================================================================
# 9. ZONAS CON MEJOR RELACION CALIDAD-PRECIO
# =============================================================================
print("\n" + "=" * 80)
print("9. ZONAS CON MEJOR RELACION CALIDAD-PRECIO")
print("=" * 80)

# Calcular indice de calidad-precio
# Menor distancia al centro + mejor precio por m2
zona_analysis = df_clean.groupby('ZONA').agg({
    'UNITPRICE': 'median',
    'DISTANCE_TO_CITY_CENTER': 'median',
    'CONSTRUCTEDAREA': 'median',
    'PRICE': 'count'
}).reset_index()

zona_analysis = zona_analysis[zona_analysis['ZONA'] != 'Desconocido']
zona_analysis['PRECIO_KM'] = zona_analysis['UNITPRICE'] / (zona_analysis['DISTANCE_TO_CITY_CENTER'] + 0.1)
zona_analysis = zona_analysis.sort_values('PRECIO_KM')

print("\nRANKING DE ZONAS (mejor precio por proximidad al centro):")
print("-" * 80)
for idx, row in zona_analysis.iterrows():
    print(f"{row['ZONA']}: {row['UNITPRICE']:.0f} EUR/m2 a {row['DISTANCE_TO_CITY_CENTER']:.1f}km del centro")

# =============================================================================
# 10. GENERAR VISUALIZACIONES
# =============================================================================
print("\n" + "=" * 80)
print("10. GENERANDO VISUALIZACIONES")
print("=" * 80)

# Crear directorio para imagenes si no existe
os.makedirs("analisis_output", exist_ok=True)

# Figura 1: Distribucion de precios
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Distribucion de Precios - Idealista Barcelona 2018', fontsize=14, fontweight='bold')

# Histograma de precios
axes[0, 0].hist(df_clean['PRICE'], bins=50, color='skyblue', edgecolor='black', alpha=0.7)
axes[0, 0].set_title('Distribucion de Precios de Venta')
axes[0, 0].set_xlabel('Precio (EUR)')
axes[0, 0].set_ylabel('Frecuencia')
axes[0, 0].axvline(df_clean['PRICE'].median(), color='red', linestyle='--', label=f'Mediana: {df_clean["PRICE"].median():.0f} EUR')
axes[0, 0].legend()

# Histograma de precio por m2
axes[0, 1].hist(df_clean['UNITPRICE'], bins=50, color='lightgreen', edgecolor='black', alpha=0.7)
axes[0, 1].set_title('Distribucion de Precio por m2')
axes[0, 1].set_xlabel('EUR/m2')
axes[0, 1].set_ylabel('Frecuencia')
axes[0, 1].axvline(df_clean['UNITPRICE'].median(), color='red', linestyle='--', label=f'Mediana: {df_clean["UNITPRICE"].median():.0f} EUR/m2')
axes[0, 1].legend()

# Boxplot por zona
zona_order = ['Centro (0-2km)', 'Cercano (2-4km)', 'Intermedio (4-6km)', 'Periferico (6-8km)', 'Lejano (>8km)']
zona_data_plot = df_clean[df_clean['ZONA'].isin(zona_order)]
sns.boxplot(data=zona_data_plot, x='ZONA', y='UNITPRICE', order=zona_order, ax=axes[1, 0])
axes[1, 0].set_title('Precio/m2 por Zona')
axes[1, 0].set_xlabel('Zona')
axes[1, 0].set_ylabel('EUR/m2')
axes[1, 0].tick_params(axis='x', rotation=45)

# Scatter: Distancia vs Precio/m2
axes[1, 1].scatter(df_clean['DISTANCE_TO_CITY_CENTER'], df_clean['UNITPRICE'], alpha=0.3, s=1)
axes[1, 1].set_title('Precio/m2 vs Distancia al Centro')
axes[1, 1].set_xlabel('Distancia al centro (km)')
axes[1, 1].set_ylabel('EUR/m2')

plt.tight_layout()
plt.savefig('analisis_output/01_distribucion_precios.png', dpi=150, bbox_inches='tight')
plt.close()
print("Guardado: 01_distribucion_precios.png")

# Figura 2: Analisis por caracteristicas
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
fig.suptitle('Impacto de Caracteristicas en Precio - Barcelona 2018', fontsize=14, fontweight='bold')

features_to_plot = ['HASTERRACE', 'HASLIFT', 'HASAIRCONDITIONING', 'HASPARKINGSPACE', 'HASSWIMMINGPOOL', 'HASGARDEN']

for idx, feature in enumerate(features_to_plot):
    row, col = idx // 3, idx % 3
    if feature in df_clean.columns:
        feature_data = df_clean.groupby(feature)['UNITPRICE'].median()
        if len(feature_data) == 2:
            feature_data.plot(kind='bar', ax=axes[row, col], color=['coral', 'lightblue'])
            axes[row, col].set_title(f'{feature}')
            axes[row, col].set_xlabel('')
            axes[row, col].set_ylabel('EUR/m2 mediano')
            axes[row, col].tick_params(axis='x', rotation=0)
            axes[row, col].set_xticklabels(['No', 'Si'])

plt.tight_layout()
plt.savefig('analisis_output/02_caracteristicas_precio.png', dpi=150, bbox_inches='tight')
plt.close()
print("Guardado: 02_caracteristicas_precio.png")

# Figura 3: Analisis por habitaciones y epoca
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.suptitle('Analisis por Tipologia y Epoca - Barcelona 2018', fontsize=14, fontweight='bold')

# Por habitaciones
if 'ROOMNUMBER' in df_clean.columns:
    room_data = df_clean[df_clean['ROOMNUMBER'] <= 6]  # Limitar a 6 habitaciones
    room_price = room_data.groupby('ROOMNUMBER')['UNITPRICE'].median()
    room_price.plot(kind='bar', ax=axes[0], color='teal', alpha=0.7)
    axes[0].set_title('Precio/m2 por Numero de Habitaciones')
    axes[0].set_xlabel('Habitaciones')
    axes[0].set_ylabel('EUR/m2 mediano')
    axes[0].tick_params(axis='x', rotation=0)

# Por epoca
if 'EPOCA' in df_clean.columns:
    epoca_order = ['Antigua (<1950)', 'Clasica (1950-1980)', 'Moderna (1980-2000)', 'Reciente (2000+)']
    epoca_data = df_clean[df_clean['EPOCA'].isin(epoca_order)]
    epoca_price = epoca_data.groupby('EPOCA')['UNITPRICE'].median().reindex(epoca_order)
    epoca_price.plot(kind='bar', ax=axes[1], color='orange', alpha=0.7)
    axes[1].set_title('Precio/m2 por Epoca de Construccion')
    axes[1].set_xlabel('Epoca')
    axes[1].set_ylabel('EUR/m2 mediano')
    axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig('analisis_output/03_tipologia_epoca.png', dpi=150, bbox_inches='tight')
plt.close()
print("Guardado: 03_tipologia_epoca.png")

# Figura 4: Mapa de calor de correlaciones
fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='RdBu_r', center=0,
            square=True, fmt='.2f', cbar_kws={'label': 'Correlacion'})
plt.title('Matriz de Correlacion - Variables Principales', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('analisis_output/04_correlaciones.png', dpi=150, bbox_inches='tight')
plt.close()
print("Guardado: 04_correlaciones.png")

# Figura 5: Rentabilidad por zona
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.suptitle('Analisis de Rentabilidad por Zona - Barcelona 2018', fontsize=14, fontweight='bold')

# Preparar datos de rentabilidad
rent_data = []
for zona in zona_order:
    if zona in df_clean['ZONA'].values:
        zona_df = df_clean[df_clean['ZONA'] == zona]
        precio_medio = zona_df['PRICE'].median()
        renta_mensual = rentas_estimadas.get(zona, 1100)
        rent_bruta = (renta_mensual * 12 / precio_medio) * 100
        rent_data.append({'Zona': zona, 'Rentabilidad': rent_bruta, 'Precio_Medio': precio_medio})

rent_df = pd.DataFrame(rent_data)

# Grafico de rentabilidad
rent_df.set_index('Zona')['Rentabilidad'].plot(kind='bar', ax=axes[0], color='green', alpha=0.7)
axes[0].set_title('Rentabilidad Bruta Estimada por Zona (2018)')
axes[0].set_xlabel('Zona')
axes[0].set_ylabel('Rentabilidad Bruta (%)')
axes[0].tick_params(axis='x', rotation=45)
axes[0].axhline(y=5, color='red', linestyle='--', label='Umbral 5%')
axes[0].legend()

# Precio medio por zona
rent_df.set_index('Zona')['Precio_Medio'].plot(kind='bar', ax=axes[1], color='purple', alpha=0.7)
axes[1].set_title('Precio Medio de Compra por Zona (2018)')
axes[1].set_xlabel('Zona')
axes[1].set_ylabel('Precio (EUR)')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig('analisis_output/05_rentabilidad_zona.png', dpi=150, bbox_inches='tight')
plt.close()
print("Guardado: 05_rentabilidad_zona.png")

# Figura 6: Evolucion temporal (si hay multiples periodos)
periods = sorted(df_clean['PERIOD'].unique())
if len(periods) > 1:
    fig, ax = plt.subplots(figsize=(12, 6))

    monthly_stats = df_clean.groupby('PERIOD').agg({
        'UNITPRICE': 'median',
        'PRICE': 'median'
    }).reset_index()

    monthly_stats['PERIOD_DATE'] = pd.to_datetime(monthly_stats['PERIOD'].astype(str), format='%Y%m')
    monthly_stats = monthly_stats.sort_values('PERIOD_DATE')

    ax.plot(monthly_stats['PERIOD_DATE'], monthly_stats['UNITPRICE'], marker='o', linewidth=2, label='Precio/m2')
    ax.set_title('Evolucion de Precios durante 2018', fontsize=14, fontweight='bold')
    ax.set_xlabel('Mes')
    ax.set_ylabel('Precio/m2 mediano (EUR)')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('analisis_output/06_evolucion_temporal.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Guardado: 06_evolucion_temporal.png")

# =============================================================================
# 11. EXPORTAR RESULTADOS
# =============================================================================
print("\n" + "=" * 80)
print("11. EXPORTANDO RESULTADOS")
print("=" * 80)

# Exportar resumen estadistico
resumen = {
    'metrica': [],
    'valor': []
}

resumen['metrica'].extend(['Registros totales', 'Precio medio', 'Precio mediano', 'Precio/m2 medio', 'Precio/m2 mediano'])
resumen['valor'].extend([
    f"{len(df_clean):,}",
    f"{df_clean['PRICE'].mean():.0f} EUR",
    f"{df_clean['PRICE'].median():.0f} EUR",
    f"{df_clean['UNITPRICE'].mean():.0f} EUR/m2",
    f"{df_clean['UNITPRICE'].median():.0f} EUR/m2"
])

resumen_df = pd.DataFrame(resumen)
resumen_df.to_csv('analisis_output/resumen_estadistico.csv', index=False)
print("Guardado: resumen_estadistico.csv")

# Exportar estadisticas por zona
zona_stats_export = df_clean.groupby('ZONA').agg({
    'PRICE': ['count', 'mean', 'median'],
    'UNITPRICE': ['mean', 'median'],
    'CONSTRUCTEDAREA': 'mean',
    'DISTANCE_TO_CITY_CENTER': 'mean'
}).round(2)
zona_stats_export.columns = ['_'.join(col).strip() for col in zona_stats_export.columns]
zona_stats_export.to_csv('analisis_output/estadisticas_por_zona.csv')
print("Guardado: estadisticas_por_zona.csv")

print("\n" + "=" * 80)
print("ANALISIS COMPLETADO")
print("=" * 80)
print("\nArchivos generados en 'analisis_output/':")
print("  - 01_distribucion_precios.png")
print("  - 02_caracteristicas_precio.png")
print("  - 03_tipologia_epoca.png")
print("  - 04_correlaciones.png")
print("  - 05_rentabilidad_zona.png")
print("  - 06_evolucion_temporal.png (si aplica)")
print("  - resumen_estadistico.csv")
print("  - estadisticas_por_zona.csv")
