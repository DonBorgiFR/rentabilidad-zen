import { create } from 'zustand';
import { RentalInputs } from '../lib/rental-engine';

interface LandlordState {
  inputs: RentalInputs;
  setInputs: (inputs: RentalInputs | ((prev: RentalInputs) => RentalInputs)) => void;
  updateInput: <K extends keyof RentalInputs>(key: K, value: RentalInputs[K]) => void;
}

const defaultInputs: RentalInputs = {
  precioCompra: 200000,
  itpIva: 10,
  gastosEscritura: 2500,
  reformaCoste: 15000,
  mobiliario: 5000,
  rentaMensual: 950,
  rentaAnterior: 900,
  indiceReferencia: 850,
  zonaTensionada: true,
  tasaVacancia: 4,
  ibi: 450,
  comunidad: 600,
  seguroHogar: 200,
  seguroImpago: 350,
  mantenimientoEstimado: 400,
  tasaBasuras: 60,
  honorariosGestion: 0,
  ltv: 80,
  interes: 3.5,
  plazoAnios: 30,
  comisionApertura: 1000,
  valorCatastralTotal: 100000,
  valorCatastralSueloPct: 20,
  salarioBase: 35000,
  autonomousRegion: 'cataluna',
  tipoReduccion: 50,
};

export const useLandlordStore = create<LandlordState>((set) => ({
  inputs: defaultInputs,
  setInputs: (inputs) => set((state) => ({ 
    inputs: typeof inputs === 'function' ? inputs(state.inputs) : inputs 
  })),
  updateInput: (key, value) => set((state) => ({
    inputs: { ...state.inputs, [key]: value }
  })),
}));
