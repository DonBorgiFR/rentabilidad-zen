# 🏡 Rentabilidad Zen — Dossier Inmobiliario BFR

Simulador de decisión inmobiliaria con dos dossiers independientes: uno para **inversores/propietarios** y otro para **inquilinos**. Diseñado para el mercado español con motor fiscal Ley de Vivienda 2024 y tasador heurístico calibrado con dataset Idealista 2018.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-indigo) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Zustand](https://img.shields.io/badge/Zustand-5-orange)

## 🎯 Dossiers Disponibles

### 📊 Dossier de Inversión (Propietario)
Auditoría de rentabilidad operativa para propietarios e inversores:
- **KPIs en tiempo real**: Rentabilidad Bruta, Neta y Real (ROE/ROA)
- **Motor fiscal Ley de Vivienda 2024**: Reducciones IRPF (90%, 70%, 60%, 50%) automáticas
- **Análisis What-If**: Compara estrategias de renta vs. bonificación fiscal
- **Cash Flow detallado**: Desglose de ingresos, gastos operativos y fiscalidad
- **Simulador de financiación**: Hipoteca con LTV, interés y amortización

### 🏠 Dossier de Inquilino
Análisis de viabilidad financiera y tasación de mercado:
- **Ratio de Esfuerzo**: Gauge visual del impacto del alquiler sobre ingresos netos (umbral 33%)
- **Tasador Heurístico BFR**: Estimación de renta justa basada en dataset Idealista 2018 ajustado a 2025 (Euribor)
- **Veredicto Estructural**: Oportunidad / Precio Justo / Sobreprecio Leve / Sobreprecio Severo
- **Desembolso Inicial**: Cálculo del efectivo total necesario para la firma (fianza, garantías, mudanza)
- **60+ municipios** con factores de ajuste calibrados

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Estado | Zustand 5 |
| Estilos | Tailwind CSS 3 |
| Gráficos | Recharts 2 |
| Iconos | Lucide React |
| PDF Export | jsPDF + html2canvas |
| Analytics (opt.) | Supabase (feedback loop) |

## 📂 Estructura del Proyecto

```
src/
├── App.tsx                          # Router principal (HeroSection → Dossier)
├── main.tsx                         # Entry point
├── index.css                        # Sistema de diseño global
├── components/
│   ├── AuditInput.tsx               # Input numérico con stepper +/-
│   ├── ui/index.tsx                 # Componentes UI reutilizables
│   ├── tenant/
│   │   └── TenantDashboard.tsx      # Dossier de Inquilino
│   ├── landlord/
│   │   └── LandlordDashboard.tsx    # Dossier de Inversión
│   └── layout/
│       ├── HeroSection.tsx          # Landing con selector de dossier
│       ├── TopNavbar.tsx            # Navegación superior
│       └── Footer.tsx               # Pie de página
├── lib/
│   ├── tenant-engine.ts             # Motor de cálculo inquilino (Idealista 2018)
│   ├── rental-engine.ts             # Motor de cálculo inversión + fiscal
│   └── supabase.ts                  # Cliente Supabase (feedback)
├── hooks/
│   └── useMercadoReference.ts       # Hook de referencia de mercado (API local)
└── store/
    ├── useAppStore.ts               # Estado global (dark mode, tabs, export)
    ├── useTenantStore.ts            # Estado del dossier inquilino
    └── useLandlordStore.ts          # Estado del dossier inversión
```

## 🚀 Cómo Empezar

### Requisitos
- [Node.js](https://nodejs.org/) ≥ 18

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
Disponible en `http://localhost:5173`

### Build de producción
```bash
npm run build
```

### Deploy a Vercel
El proyecto está configurado para deploy automático con Vercel. Framework: **Vite**.

## 📄 Documentación
- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
- [Guía del Inversor](./docs/GUIA_INVERSOR.md)
- [Análisis Técnico de Cálculos](./ANALISIS_TECNICO_CALCULOS.md)
- [Visión General del Proyecto](./PROJECT_OVERVIEW.md)

---
Desarrollado con enfoque en **precisión fiscal** y **excelencia visual**.
