import { create } from 'zustand'
import {
  defaultLayers,
  type LayerId,
  type LocalPosition,
  type SelectedLocation,
  type VirtualFacility,
} from './data/demo'

export type ToolMode = 'navigate' | 'place' | 'move'

interface AppState {
  layers: Record<LayerId, boolean>
  selectedLocation: SelectedLocation | null
  selectedFacilityId: string | null
  facilities: VirtualFacility[]
  toolMode: ToolMode
  toggleLayer: (layer: LayerId) => void
  selectLocation: (location: SelectedLocation | null) => void
  selectFacility: (id: string | null) => void
  setToolMode: (mode: ToolMode) => void
  addFacility: (position: LocalPosition) => void
  moveFacility: (id: string, position: LocalPosition) => void
  removeSelectedFacility: () => void
  setLayerVisibility: (layer: LayerId, visible: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  layers: defaultLayers,
  selectedLocation: null,
  selectedFacilityId: null,
  facilities: [],
  toolMode: 'navigate',
  toggleLayer: (layer) => set((state) => ({
    layers: { ...state.layers, [layer]: !state.layers[layer] },
  })),
  selectLocation: (location) => set({ selectedLocation: location, selectedFacilityId: null }),
  selectFacility: (id) => set({ selectedFacilityId: id }),
  setToolMode: (mode) => set({ toolMode: mode }),
  addFacility: (position) => set((state) => {
    const facility: VirtualFacility = {
      id: `virtual-${crypto.randomUUID()}`,
      name: `仮想防災拠点 ${state.facilities.length + 1}`,
      createdAt: new Date().toISOString(),
      ...position,
    }
    return { facilities: [...state.facilities, facility], selectedFacilityId: facility.id, toolMode: 'navigate' }
  }),
  moveFacility: (id, position) => set((state) => ({
    facilities: state.facilities.map((facility) => facility.id === id ? { ...facility, ...position } : facility),
    selectedFacilityId: id,
    toolMode: 'navigate',
  })),
  removeSelectedFacility: () => set((state) => ({
    facilities: state.facilities.filter((facility) => facility.id !== state.selectedFacilityId),
    selectedFacilityId: null,
    toolMode: 'navigate',
  })),
  setLayerVisibility: (layer, visible) => set((state) => ({
    layers: { ...state.layers, [layer]: visible },
  })),
}))
