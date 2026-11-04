import { describe, expect, it } from 'vitest'
import { createDemoBuildings, createTerrainGeometry, terrainElevation } from './demo'

describe('仮想デモ地形', () => {
  it('起伏があり、有限の表示用標高を生成する', () => {
    const heights = [
      terrainElevation(-8, -8),
      terrainElevation(-4, 2),
      terrainElevation(0, 0),
      terrainElevation(7, 5),
    ]

    expect(heights.every(Number.isFinite)).toBe(true)
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(0.5)
  })

  it('有限な頂点と上向き法線を持つ三角形メッシュを生成する', () => {
    const geometry = createTerrainGeometry()
    const positions = geometry.getAttribute('position')
    const normals = geometry.getAttribute('normal')

    expect(positions.count).toBe(53 * 53)
    expect(normals.count).toBe(positions.count)
    expect(Array.from(positions.array).every(Number.isFinite)).toBe(true)
    expect(normals.getY(26 * 53 + 26)).toBeGreaterThan(0)
    geometry.dispose()
  })

  it('仮想洪水表示の段階で地形色だけを変える', () => {
    const base = createTerrainGeometry(0)
    const progressed = createTerrainGeometry(3)

    expect(Array.from(base.getAttribute('color').array)).not.toEqual(Array.from(progressed.getAttribute('color').array))
    expect(Array.from(base.getAttribute('position').array)).toEqual(Array.from(progressed.getAttribute('position').array))
    base.dispose()
    progressed.dispose()
  })

  it('説明用の仮想建物を有限座標で生成する', () => {
    const buildings = createDemoBuildings()
    expect(buildings.length).toBeGreaterThan(50)
    expect(buildings.every(({ x, z, height }) => Number.isFinite(x) && Number.isFinite(z) && height > 0)).toBe(true)
  })
})
