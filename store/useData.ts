import { create } from "zustand";
import { Location } from "../interfaces/location";
import { NavigationProp, useNavigation } from "@react-navigation/native";

interface DataState {
  inputData: Location | null;
  setInputData: (location: Location) => void;
  getInputData: () => Location | null;
}

// TODO:  ESTO FUE DE PRUEBA, SOLO FUNCIONÓ el setInputData
export const useData = create<DataState>((set, get) => ({
  inputData: null,

  setInputData: (location: Location) => {
    set({ inputData: location });
  },

  getInputData: () => {
    return get().inputData;
  }
}));

