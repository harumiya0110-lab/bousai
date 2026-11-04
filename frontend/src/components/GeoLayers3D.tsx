import { useEffect, useMemo, useRef } from 'react'
import { Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Object3D, Path, Shape, ShapeGeometry, DoubleSide, type InstancedMesh } from 'three'
import type { GeoJsonFeature, GeoJsonGeometry, GeoJsonPosition, GeoLayerRecord } from '../data/geojson'

interface Projection {
  centerLongitude: number
  centerLatitude: number
  longitudeScale: number
  scale: number
}

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

interface GeometryParts {
  points: GeoJsonPosition[]
  lines: GeoJsonPosition[][]
  polygons: GeoJsonPosition[][][]
}

interface PointRecord {
  position: GeoJsonPosition
  feature: GeoJsonFeature
}

interface LineRecord {
  positions: GeoJsonPosition[]
  feature: GeoJsonFeature
}

interface PolygonRecord {
  rings: GeoJsonPosition[][]
  feature: GeoJsonFeature
}

interface RenderParts {
  points: PointRecord[]
  lines: LineRecord[]
  polygons: PolygonRecord[]
}

type SelectFeature = (layer: GeoLayerRecord, feature: GeoJsonFeature) => void

function emptyParts(): GeometryParts {
  return { points: [], lines: [], polygons: [] }
}

function isPosition(value: unknown): value is GeoJsonPosition {
  return Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
}

function collectParts(geometry: GeoJsonGeometry | null, result: GeometryParts): void {
  if (!geometry) return
  if (geometry.type === 'GeometryCollection') {
    for (const child of geometry.geometries ?? []) collectParts(child, result)
    return
  }

  const coordinates = geometry.coordinates
  if (geometry.type === 'Point') {
    if (isPosition(coordinates)) result.points.push(coordinates)
  } else if (geometry.type === 'MultiPoint') {
    if (Array.isArray(coordinates)) {
      for (const position of coordinates) {
        if (isPosition(position)) result.points.push(position)
      }
    }
  } else if (geometry.type === 'LineString') {
    if (Array.isArray(coordinates) && coordinates.every(isPosition)) result.lines.push(coordinates)
  } else if (geometry.type === 'MultiLineString') {
    if (Array.isArray(coordinates)) {
      for (const line of coordinates) {
        if (Array.isArray(line) && line.every(isPosition)) result.lines.push(line)
      }
    }
  } else if (geometry.type === 'Polygon') {
    if (Array.isArray(coordinates)) {
      const rings = coordinates.filter((ring): ring is GeoJsonPosition[] => Array.isArray(ring) && ring.every(isPosition))
      if (rings.length > 0) result.polygons.push(rings)
    }
  } else if (geometry.type === 'MultiPolygon') {
    if (Array.isArray(coordinates)) {
      for (const polygon of coordinates) {
        if (!Array.isArray(polygon)) continue
        const rings = polygon.filter((ring): ring is GeoJsonPosition[] => Array.isArray(ring) && ring.every(isPosition))
        if (rings.length > 0) result.polygons.push(rings)
      }
    }
  }
}

function collectLayerBounds(layers: GeoLayerRecord[]): Bounds | null {
  if (layers.length === 0) return null
  const centerLatitude = layers.reduce(
    (sum, layer) => sum + (layer.bounds.south + layer.bounds.north) / 2,
    0,
  ) / layers.length
  const longitudeScale = Math.cos(centerLatitude * Math.PI / 180)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const layer of layers) {
    minX = Math.min(minX, layer.bounds.west * longitudeScale)
    maxX = Math.max(maxX, layer.bounds.east * longitudeScale)
    minY = Math.min(minY, layer.bounds.south)
    maxY = Math.max(maxY, layer.bounds.north)
  }
  return Number.isFinite(minX) && Number.isFinite(maxX) ? { minX, maxX, minY, maxY } : null
}

function createProjection(bounds: Bounds, layers: GeoLayerRecord[]): Projection {
  const centerLatitude = layers.reduce(
    (sum, layer) => sum + (layer.bounds.south + layer.bounds.north) / 2,
    0,
  ) / Math.max(1, layers.length)
  const longitudeScale = Math.max(0.0001, Math.cos(centerLatitude * Math.PI / 180))
  const centerLongitude = (bounds.minX + bounds.maxX) / 2 / longitudeScale
  const width = Math.max(0.000001, bounds.maxX - bounds.minX)
  const height = Math.max(0.000001, bounds.maxY - bounds.minY)
  return {
    centerLongitude,
    centerLatitude,
    longitudeScale,
    scale: 15 / Math.max(width, height),
  }
}

function project(position: GeoJsonPosition, projection: Projection): [number, number] {
  const x = (position[0] - projection.centerLongitude) * projection.longitudeScale
  const z = -(position[1] - projection.centerLatitude)
  return [x * projection.scale, z * projection.scale]
}

const CATEGORY_COLORS: Record<GeoLayerRecord['category'], string> = {
  flood: '#3caee0',
  shelters: '#56d99a',
  roads: '#edbd68',
  buildings: '#c6d5e1',
  other: '#a9a0f5',
}

function flattenFeature(feature: GeoJsonFeature): GeometryParts {
  const result = emptyParts()
  collectParts(feature.geometry, result)
  return result
}

function PolygonSurface({ record, projection, color, layer, onSelectFeature }: {
  record: PolygonRecord
  projection: Projection
  color: string
  layer: GeoLayerRecord
  onSelectFeature: SelectFeature
}) {
  const geometry = useMemo(() => {
    const outer = record.rings[0]
    if (!outer || outer.length < 4) return null
    const shape = new Shape()
    outer.forEach((position, index) => {
      const [x, z] = project(position, projection)
      if (index === 0) shape.moveTo(x, -z)
      else shape.lineTo(x, -z)
    })
    for (const ring of record.rings.slice(1)) {
      if (ring.length < 4) continue
      const hole = new Path()
      ring.forEach((position, index) => {
        const [x, z] = project(position, projection)
        if (index === 0) hole.moveTo(x, -z)
        else hole.lineTo(x, -z)
      })
      shape.holes.push(hole)
    }
    const result = new ShapeGeometry(shape)
    result.rotateX(-Math.PI / 2)
    return result
  }, [record.rings, projection])

  useEffect(() => () => geometry?.dispose(), [geometry])
  if (!geometry) return null
  return (
    <mesh
      geometry={geometry}
      position={[0, 0.12, 0]}
      onClick={(event) => {
        event.stopPropagation()
        onSelectFeature(layer, record.feature)
      }}
    >
      <meshBasicMaterial color={color} transparent opacity={0.48} side={DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function PointInstances({ records, projection, color, layer, onSelectFeature }: {
  records: PointRecord[]
  projection: Projection
  color: string
  layer: GeoLayerRecord
  onSelectFeature: SelectFeature
}) {
  const mesh = useRef<InstancedMesh>(null)
  useEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    records.forEach(({ position }, index) => {
      const [x, z] = project(position, projection)
      transform.position.set(x, 0.28, z)
      transform.scale.setScalar(1)
      transform.updateMatrix()
      mesh.current?.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [records, projection])

  const selectInstance = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (event.instanceId === undefined) return
    const record = records[event.instanceId]
    if (record) onSelectFeature(layer, record.feature)
  }

  if (records.length === 0) return null
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, records.length]} onClick={selectInstance}>
      <sphereGeometry args={[0.105, 8, 6]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

function GeoLayerVisual({ layer, projection, onSelectFeature }: {
  layer: GeoLayerRecord
  projection: Projection
  onSelectFeature: SelectFeature
}) {
  const visual = useMemo(() => {
    const result: RenderParts = { points: [], lines: [], polygons: [] }
    // Keep the data intact in IndexedDB, but bound interactive draw calls and vertex counts.
    const maxPoints = 8_000
    const maxLines = 500
    const maxPolygons = 500
    const sample = (positions: GeoJsonPosition[], maximum: number) => {
      if (positions.length <= maximum) return positions
      const stride = (positions.length - 1) / (maximum - 1)
      return Array.from({ length: maximum }, (_, index) => positions[Math.round(index * stride)])
    }
    for (const feature of layer.collection.features.slice(0, 2500)) {
      const parts = flattenFeature(feature)
      for (const position of parts.points) {
        if (result.points.length >= maxPoints) break
        result.points.push({ position, feature })
      }
      for (const line of parts.lines) {
        if (result.lines.length >= maxLines) break
        if (line.length >= 2) result.lines.push({ positions: sample(line, 1200), feature })
      }
      for (const polygon of parts.polygons) {
        if (result.polygons.length >= maxPolygons) break
        const sampledRings = polygon.map((ring) => sample(ring, 600))
        if (sampledRings[0]?.length >= 4) result.polygons.push({ rings: sampledRings, feature })
      }
      if (result.points.length >= maxPoints && result.lines.length >= maxLines && result.polygons.length >= maxPolygons) break
    }
    return result
  }, [layer])
  const color = CATEGORY_COLORS[layer.category]

  return (
    <group>
      {visual.polygons.map((record, index) => (
        <PolygonSurface
          key={layer.id + '-polygon-' + index}
          record={record}
          layer={layer}
          projection={projection}
          color={color}
          onSelectFeature={onSelectFeature}
        />
      ))}
      {visual.lines.map((record, index) => (
        <Line
          key={layer.id + '-line-' + index}
          points={record.positions.map((position) => {
            const [x, z] = project(position, projection)
            return [x, 0.2, z] as [number, number, number]
          })}
          color={color}
          lineWidth={layer.category === 'roads' ? 2.2 : 1.5}
          transparent
          opacity={0.92}
          onClick={(event) => {
            event.stopPropagation()
            onSelectFeature(layer, record.feature)
          }}
        />
      ))}
      <PointInstances
        records={visual.points}
        layer={layer}
        projection={projection}
        color={color}
        onSelectFeature={onSelectFeature}
      />
    </group>
  )
}

export function GeoLayers3D({ layers, onSelectFeature }: {
  layers: GeoLayerRecord[]
  onSelectFeature: SelectFeature
}) {
  const bounds = useMemo(() => collectLayerBounds(layers), [layers])
  const projection = useMemo(() => bounds ? createProjection(bounds, layers) : null, [bounds, layers])
  if (!bounds || !projection) return null

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color="#132333" />
      </mesh>
      <gridHelper args={[18, 18, '#496477', '#263e50']} position={[0, 0.015, 0]} />
      {layers.map((layer) => (
        <GeoLayerVisual
          key={layer.id}
          layer={layer}
          projection={projection}
          onSelectFeature={onSelectFeature}
        />
      ))}
    </group>
  )
}
