import type { Color, BufferGeometry } from 'three'
import { BufferAttribute, BufferGeometry as ThreeBufferGeometry, Color as ThreeColor } from 'three'

export type LayerId = 'terrain' | 'buildings' | 'roads' | 'river' | 'flood' | 'shelters' | 'virtual'

export const demoLayers: { id: LayerId; label: string; detail: string }[] = [
  { id: 'terrain', label: '仮想地形', detail: '地形イメージ' },
  { id: 'buildings', label: '建物モデル', detail: '仮想建物（デモ）' },
  { id: 'roads', label: '道路網', detail: '仮想データ' },
  { id: 'river', label: '河川', detail: '仮想データ' },
  { id: 'flood', label: '洪水区域', detail: '教育用仮想シナリオ' },
  { id: 'shelters', label: '避難場所', detail: '仮想データ' },
  { id: 'virtual', label: '仮想防災施設', detail: 'ユーザー配置' },
]

export const DEMO_ONLY_WARNING = 'この画面は仮想データによる教育用デモです。実際の浸水・到達時刻・避難の安全性を予測するものではありません。'

export interface LocalPosition {
  x: number
  z: number
}

export interface SelectedLocation {
  title: string
  position: LocalPosition
  elevation: number | null
  source: string
  note: string
}

export interface VirtualFacility extends LocalPosition {
  id: string
  name: string
  createdAt: string
}

export const defaultLayers: Record<LayerId, boolean> = {
  terrain: true,
  buildings: true,
  roads: true,
  river: true,
  flood: false,
  shelters: true,
  virtual: true,
}

export function terrainElevation(x: number, z: number): number {
  const ridge = Math.sin((x + 1.8) * 0.31) * Math.cos((z - 0.8) * 0.27) * 0.78
  const hill = Math.exp(-((x + 4.2) ** 2 + (z + 2.4) ** 2) / 25) * 1.1
  const slope = Math.cos((x - z) * 0.19) * 0.34
  return Number((1.45 + ridge + hill + slope).toFixed(3))
}

function interpolateColor(low: Color, high: Color, amount: number): Color {
  return low.clone().lerp(high, Math.max(0, Math.min(1, amount)))
}

export function createTerrainGeometry(floodStep = 0): BufferGeometry {
  const divisions = 52
  const size = 18
  const vertexCount = (divisions + 1) ** 2
  const positions = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const indices: number[] = []
  const low = new ThreeColor('#315c55')
  const middle = new ThreeColor('#739269')
  const high = new ThreeColor('#a28a69')
  const floodColor = new ThreeColor('#3cafd3')

  for (let row = 0; row <= divisions; row += 1) {
    for (let column = 0; column <= divisions; column += 1) {
      const index = row * (divisions + 1) + column
      const x = (column / divisions - 0.5) * size
      const z = (row / divisions - 0.5) * size
      const elevation = terrainElevation(x, z)
      positions.set([x, elevation, z], index * 3)

      const base = elevation < 1.3
        ? interpolateColor(low, middle, (elevation - 0.5) / 0.8)
        : interpolateColor(middle, high, (elevation - 1.3) / 1.7)
      const riverDistance = Math.abs(x - Math.sin(z * 0.38) * 1.35)
      const floodThreshold = 0.48 + floodStep * 0.4
      const withinVirtualFloodFootprint = floodStep > 0 && elevation < 1.7 && riverDistance < floodThreshold
      const finalColor = withinVirtualFloodFootprint
        ? interpolateColor(base, floodColor, 0.45 + floodStep * 0.12)
        : base
      colors.set([finalColor.r, finalColor.g, finalColor.b], index * 3)

      if (column < divisions && row < divisions) {
        const nextColumn = index + 1
        const nextRow = index + divisions + 1
        indices.push(index, nextRow, nextColumn, nextColumn, nextRow, nextRow + 1)
      }
    }
  }

  const geometry = new ThreeBufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export interface DemoBuilding extends LocalPosition {
  id: string
  height: number
}

export function createDemoBuildings(): DemoBuilding[] {
  const buildings: DemoBuilding[] = []
  let serial = 1
  for (let row = -6; row <= 6; row += 1) {
    for (let column = -6; column <= 6; column += 1) {
      const x = column * 1.25 + ((row + column) % 2) * 0.16
      const z = row * 1.25
      const riverX = Math.sin(z * 0.38) * 1.35
      const onRoad = Math.abs(z) < 0.35 || Math.abs(z - 5) < 0.35 || Math.abs(x + 5) < 0.35
      if (onRoad || Math.abs(x - riverX) < 1.15 || (row * 7 + column * 11) % 5 === 0) continue
      buildings.push({
        id: `demo-building-${serial}`,
        x,
        z,
        height: 0.55 + ((serial * 37) % 9) * 0.12,
      })
      serial += 1
    }
  }
  return buildings
}
