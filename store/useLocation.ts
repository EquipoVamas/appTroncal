import { create } from "zustand";
import { Location } from "../interfaces/location";
import { getCurrentLocation } from "../components/Functions";

interface LocationState {
  lastKnownLocation?: Location | null;
  getLocation: () => Promise<Location | null>;
}

export const useLocation = create<LocationState>()((set, get) => ({
  lastKnownLocation: null,

  getLocation: async () => {
    const location = await getCurrentLocation();
    set({ lastKnownLocation: location });
    return location;
  }
}));
