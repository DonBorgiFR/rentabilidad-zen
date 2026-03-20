import { create } from 'zustand';
import { TenantInputs } from '../lib/tenant-engine';

interface TenantState {
  inputs: TenantInputs;
  setInputs: (inputs: TenantInputs | ((prev: TenantInputs) => TenantInputs)) => void;
  updateInput: <K extends keyof TenantInputs>(key: K, value: TenantInputs[K]) => void;
}

const defaultInputs: TenantInputs = {
  ingresoNetoMensual: 2500,
  rentaSolicitada: 950,
  mesesFianza: 1,
  mesesGarantiaAdicional: 1,
  otrosGastosIniciales: 500,
  municipio: 'barcelona',
  barrio: 'eixample',
  metrosCuadrados: 80,
  zona: 'media',
  estado: 'bueno',
  habitaciones: 2,
  banos: 1,
  planta: 2,
  tieneAscensor: true,
  tieneParking: false,
  tieneTerraza: false,
  tieneAireAcondicionado: true
};

export const useTenantStore = create<TenantState>((set) => ({
  inputs: defaultInputs,
  setInputs: (inputs) => set((state) => ({ 
    inputs: typeof inputs === 'function' ? inputs(state.inputs) : inputs 
  })),
  updateInput: (key, value) => set((state) => ({
    inputs: { ...state.inputs, [key]: value }
  })),
}));
