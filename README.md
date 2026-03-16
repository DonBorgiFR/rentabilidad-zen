# 📈 RentabilidadReal: Simulador Inmobiliario Avanzado

Una herramienta de cálculo de rentabilidad inmobiliaria **Premium**, diseñada específicamente para el mercado de Barcelona y zonas tensionadas, integrando el motor fiscal de la Ley de Vivienda 2024.

![Modern UI Preview](https://img.shields.io/badge/UX-Premium-emerald) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-indigo) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## 🚀 Características Principales

- **Cálculo Reactivo**: Olvida los botones de "calcular". Los resultados (ROE, ROA, Cash Flow) se actualizan al instante.
- **Motor Fiscal Ley Vivienda 2024**: Implementa las nuevas reducciones de IRPF (90%, 70%, 60%, 50%) de forma automática.
- **Dashboard de KPIs**: Visualiza Rentabilidad Bruta, Neta y Real con micro-animaciones profesionales.
- **Comparador "What-If"**: Analiza si te conviene bajar la renta para ahorrar impuestos o cambiar de modelo de alquiler.
- **Diseño Glassmorphism**: Una interfaz moderna y limpia con soporte nativo para **Modo Oscuro**.

## 🛠️ Stack Tecnológico

- **Core**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Iconos**: [Lucide React](https://lucide.dev/)

## 📂 Estructura del Proyecto

- `src/App.tsx`: Motor de cálculo fiscal y lógica de UI.
- `src/index.css`: Sistema de diseño basado en Tailwind y efectos Glassmorphism.
- `docs/`: Manual de usuario y guía financiera para inversores.

## 🏃 Cómo empezar

### Requisitos previos
- [Node.js](https://nodejs.org/) (versión 18 o superior)

### Instalación
1. Clona el repositorio o abre la carpeta en tu terminal.
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Ejecución
Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### Construcción
Para generar la versión optimizada de producción:
```bash
npm run build
```

## 📄 Documentación Complementaria
- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
- [Guía del Inversor](./docs/GUIA_INVERSOR.md)

---
Desarrollado con enfoque en la **precisión fiscal** y la **excelencia visual**.
