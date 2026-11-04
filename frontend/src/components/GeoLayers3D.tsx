import { useEffect, useMemo, useRef } from 'react'
import { Line } from '@react-three/drei'
import { Object3D, Path, Shape, ShapeGeometry, DoubleSide, type InstancedMesh } from 'three'
import type { GeoJsonFeature, GeoJsonGeometry, GeoJsonPosition, GeoLayerRecord } from '../data/geojson'
import { getFeaturePositions } from '../data/geojson'

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
    if (Array.isArray(coordinates)) result.points.push(...coordinates.filter(isPosition))
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
  const positions = layers.flatMap((layer) => layer.collection.features.flatMap(getFeaturePositions))
  if (positions.length === 0) return null
  const centerLatitude = positions.reduce((sum, position) => sum + position[1], 0) / positions.length
  const longitudeScale = Math.cos(centerLatitude * Math.PI / 180)
  const xs = positions.map((position) => position[0] * longitudeScale)
  const ys = positions.map((position) => position[1])
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

function createProjection(bounds: Bounds, layers: GeoLayerRecord[]): Projection {
  const positions = layers.flatMap((layer) => layer.collection.features.flatMap(getFeaturePositions))
  const centerLatitude = positions.reduce((sum, position) => sum + position[1], 0) / Math.max(1, positions.length)
  const centerLongitude = (bounds.minX + bounds.maxX) / 2 / Math.max(0.0001, Math.cos(centerLatitude * Math.PI / 180))
  const width = Math.max(0.000001, bounds.maxX - bounds.minX)
  const height = Math.max(0.000001, bounds.maxY - bounds.minY)
  return {
    centerLongitude,
    centerLatitude,
    longitudeScale: Math.cos(centerLatitude * Math.PI / 180),
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

function PolygonSurface({ rings, projection, color }: {
  rings: GeoJsonPosition[][]
  projection: Projection
  color: string
}) {
  const geometry = useMemo(() => {
    const outer = rings[0]
    if (!outer || outer.length < 4) return null
    const shape = new Shape()
    outer.forEach((position, index) => {
      const [x, z] = project(position, projection)
      if (index === 0) shape.moveTo(x, -z)
      else shape.lineTo(x, -z)
    })
    for (const ring of rings.slice(1)) {
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
  }, [rings, projection])

  useEffect(() => () => geometry?.dispose(), [geometry])
  if (!geometry) return null
  return (
    <mesh geometry={geometry} position={[0, 0.12, 0]}>
      <meshBasicMaterial color={color} transparent opacity={0.48} side={DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function PointInstances({ positions, projection, color }: {
  positions: GeoJsonPosition[]
  projection: Projection
  color: string
}) {
  const mesh = useRef<InstancedMesh>(null)
  useEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    positions.forEach((position, index) => {
      const [x, z] = project(position, projection)
      transform.position.set(x, 0.28, z)
      transform.scale.setScalar(1)
      transform.updateMatrix()
      mesh.current?.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [positions, projection])

  if (positions.length === 0) return null
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, positions.length]}>
      <sphereGeometry args={[0.105, 8, 6]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

function GeoLayerVisual({ layer, projection }: { layer: GeoLayerRecord; projection: Projection }) {
  const visual = useMemo(() => {
    const result: GeometryParts = emptyParts()
    // Rendering is intentionally capped per layer to protect browsers from huge GeoJSON files.
    for (const feature of layer.collection.features.slice(0, 5000)) {
      const parts = flattenFeature(feature)
      result.points.push(...parts.points)
      result.lines.push(...parts.lines)
      result.polygons.push(...parts.polygons)
    }
    return result
  }, [layer])
  const color = CATEGORY_COLORS[layer.category]

  return (
    <group>
      {visual.polygons.map((rings, index) => (
        <PolygonSurface key={layer.id + '-polygon-' + index} rings={rings} projection={projection} color={color} />
      ))}
      {visual.lines.map((line, index) => (
        <Line
          key={layer.id + '-line-' + index}
          points={line.map((position) => {
            const [x, z] = project(position, projection)
            return [x, 0.2, z] as [number, number, number]
          })}
          color={color}
          lineWidth={layer.category === 'roads' ? 2.2 : 1.5}
          transparent
          opacity={0.92}
        />
      ))}
      <PointInstances positions={visual.points} projection={projection} color={color} />
    </group>
  )
}

export function GeoLayers3D({ layers }: { layers: GeoLayerRecord[] }) {
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
      {layers.map((layer) => <GeoLayerVisual key={layer.id} layer={layer} projection={projection} />)}
    </group>
  )
}
