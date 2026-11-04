import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './store'

describe('仮想施設の状態管理', () => {
  beforeEach(() => {
    useAppStore.setState({
      layers: {
        terrain: true,
        buildings: true,
        roads: true,
        river: true,
        flood: false,
        shelters: true,
        virtual: true,
      },
      selectedLocation: null,
      selectedFacilityId: null,
      facilities: [],
      toolMode: 'navigate',
    })
  })

  it('施設を追加、移動、削除して選択状態を更新する', () => {
    const store = useAppStore.getState()
    store.addFacility({ x: 1, z: 2 })

    const added = useAppStore.getState()
    expect(added.facilities).toHaveLength(1)
    expect(added.selectedFacilityId).toBe(added.facilities[0].id)
    expect(added.toolMode).toBe('navigate')

    added.moveFacility(added.facilities[0].id, { x: -3, z: 4 })
    expect(useAppStore.getState().facilities[0]).toMatchObject({ x: -3, z: 4 })

    useAppStore.getState().removeSelectedFacility()
    expect(useAppStore.getState().facilities).toHaveLength(0)
    expect(useAppStore.getState().selectedFacilityId).toBeNull()
  })
})
